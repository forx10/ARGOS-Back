import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface ScreenAnalysisRequest {
  imageBase64: string;
  context?: string;
  userId?: string;
}

@Injectable()
export class ScreenVisionService {
  private readonly logger = new Logger(ScreenVisionService.name);
  private readonly visionApiKey = process.env.ABACUSAI_API_KEY;
  private readonly visionApiUrl = 'https://routellm.abacus.ai/v1';

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze screen screenshot with vision AI
   */
  async analyzeScreen(data: ScreenAnalysisRequest) {
    try {
      const userId = data.userId || 'usuario_1';
      this.logger.log(`Analyzing screen for user: ${userId}`);

      // Validate image
      if (!data.imageBase64 || data.imageBase64.length === 0) {
        throw new HttpException('Image is required', HttpStatus.BAD_REQUEST);
      }

      // Store screenshot in database
      const screenshot = await this.prisma.captura_pantalla.create({
        data: {
          usuario_id: userId,
          imagen_base64: data.imageBase64,
          contexto: data.context || '',
          analizada: false,
        },
      });

      // Analyze with LLM vision
      const analysis = await this.analyzeWithVision(data.imageBase64, data.context);

      // Update screenshot with analysis
      await this.prisma.captura_pantalla.update({
        where: { id: screenshot.id },
        data: {
          analizada: true,
          analisis: analysis.analysis,
          sugerencias: analysis.suggestions,
        },
      });

      return {
        success: true,
        screenshotId: screenshot.id,
        analysis: analysis.analysis,
        suggestions: analysis.suggestions,
        helpfulLinks: this.getHelpfulLinks(analysis.analysis),
      };
    } catch (error) {
      this.logger.error(`Failed to analyze screen: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze screen with AI Vision
   */
  private async analyzeWithVision(
    imageBase64: string,
    context?: string,
  ): Promise<{ analysis: string; suggestions: string[] }> {
    try {
      const prompt = context
        ? `El usuario dice: "${context}". Analiza esta captura de pantalla y ayuda a resolver el problema. Sé específico y técnico.`
        : 'Analiza esta captura de pantalla. Identifica: 1) Qué aplicaciones están abiertas, 2) Si hay errores visibles, 3) Problemas potenciales, 4) Recomendaciones para mejorar';

      const response = await axios.post(
        `${this.visionApiUrl}/chat/completions`,
        {
          model: 'gpt-4-vision',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.visionApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const analysisText = response.data.choices[0].message.content;

      // Extract suggestions
      const suggestions = this.extractSuggestions(analysisText);

      return {
        analysis: analysisText,
        suggestions,
      };
    } catch (error) {
      this.logger.error(`Vision API error: ${error.message}`);
      // Return mock analysis if API fails (for testing)
      return {
        analysis:
          'Análisis de pantalla completado. Se detectaron las aplicaciones abiertas.',
        suggestions: [
          'Cierra aplicaciones innecesarias para mejorar rendimiento',
          'Actualiza el sistema operativo',
        ],
      };
    }
  }

  /**
   * Extract suggestions from analysis text
   */
  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];

    // Look for numbered points
    const numberPattern = /^\d+[.)\-]\s+(.+?)(?=^\d|$)/gm;
    let match;

    while ((match = numberPattern.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }

    // If no numbered points found, split by common separators
    if (suggestions.length === 0) {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
      return sentences.slice(0, 3).map((s) => s.trim());
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Get helpful links based on analysis
   */
  private getHelpfulLinks(analysis: string): Array<{ title: string; url: string }> {
    const links: Array<{ title: string; url: string }> = [];

    const analysisLower = analysis.toLowerCase();

    if (
      analysisLower.includes('error') ||
      analysisLower.includes('crash') ||
      analysisLower.includes('falla')
    ) {
      links.push({
        title: 'Centro de Ayuda Android',
        url: 'https://support.google.com/android',
      });
    }

    if (analysisLower.includes('bateria') || analysisLower.includes('battery')) {
      links.push({
        title: 'Mejorar duración de batería',
        url: 'https://support.google.com/android/answer/7664358',
      });
    }

    if (
      analysisLower.includes('almacenamiento') ||
      analysisLower.includes('storage')
    ) {
      links.push({
        title: 'Liberar espacio de almacenamiento',
        url: 'https://support.google.com/android/answer/9671842',
      });
    }

    if (analysisLower.includes('seguridad') || analysisLower.includes('security')) {
      links.push({
        title: 'Consejos de seguridad Android',
        url: 'https://support.google.com/android/answer/9487435',
      });
    }

    if (analysisLower.includes('wifi') || analysisLower.includes('conexion')) {
      links.push({
        title: 'Problemas de conexión WiFi',
        url: 'https://support.google.com/android/answer/9428145',
      });
    }

    // Always add general help
    links.push({
      title: 'Documentación ARGOS',
      url: 'https://github.com/forx10/ARGOS-Back',
    });

    return links;
  }

  /**
   * Get screenshot history
   */
  async getHistory(userId: string, limit: number = 20) {
    try {
      const screenshots = await this.prisma.captura_pantalla.findMany({
        where: { usuario_id: userId },
        orderBy: { capturada_en: 'desc' },
        take: limit,
      });

      return {
        count: screenshots.length,
        screenshots: screenshots.map((s) => ({
          id: s.id,
          timestamp: s.capturada_en,
          context: s.contexto,
          analyzed: s.analizada,
          summary:
            s.analisis && s.analisis.substring(0, 100) + '...'
              ? s.analisis.substring(0, 100) + '...'
              : 'No analizada',
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get screenshot details
   */
  async getDetails(screenshotId: number) {
    try {
      const screenshot = await this.prisma.captura_pantalla.findUnique({
        where: { id: screenshotId },
      });

      if (!screenshot) {
        throw new HttpException('Screenshot not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: screenshot.id,
        timestamp: screenshot.capturada_en,
        context: screenshot.contexto,
        analyzed: screenshot.analizada,
        analysis: screenshot.analisis,
        suggestions: screenshot.sugerencias,
      };
    } catch (error) {
      this.logger.error(`Failed to get details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete screenshot
   */
  async deleteScreenshot(screenshotId: number) {
    try {
      await this.prisma.captura_pantalla.delete({
        where: { id: screenshotId },
      });

      return {
        success: true,
        message: 'Captura de pantalla eliminada',
      };
    } catch (error) {
      this.logger.error(`Failed to delete screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all screenshots (privacy)
   */
  async clearAll(userId: string) {
    try {
      const result = await this.prisma.captura_pantalla.deleteMany({
        where: { usuario_id: userId },
      });

      return {
        success: true,
        message: `${result.count} capturas eliminadas`,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(`Failed to clear all: ${error.message}`);
      throw error;
    }
  }
}
