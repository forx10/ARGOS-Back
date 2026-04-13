import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FileData {
  nombre: string;
  rutaCompleta: string;
  tipo?: string;
  tamanoBytes?: number;
  extension?: string;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

@Injectable()
export class SdFilesService {
  private readonly logger = new Logger(SdFilesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Index files from SD card (received from Tasker)
   */
  async indexFiles(userId: string, files: FileData[]) {
    try {
      this.logger.log(`Indexing ${files.length} files for user: ${userId}`);

      const indexed: any[] = [];
      for (const file of files) {
        const created = await this.prisma.archivo_sd.create({
          data: {
            usuario_id: userId,
            nombre: file.nombre,
            ruta_completa: file.rutaCompleta,
            tipo: file.tipo || this.detectFileType(file.extension || ''),
            tamano_bytes: file.tamanoBytes ? BigInt(file.tamanoBytes) : null,
            extension: file.extension || this.extractExtension(file.nombre),
            fecha_creacion: file.fechaCreacion,
            fecha_modificacion: file.fechaModificacion,
          },
        });
        indexed.push(created);
      }

      return {
        success: true,
        message: `${indexed.length} archivos indexados`,
        count: indexed.length,
      };
    } catch (error) {
      this.logger.error(`Failed to index files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search files by name or type
   */
  async searchFiles(userId: string, query: string, tipo?: string) {
    try {
      this.logger.log(`Searching files for: ${query}`);

      const where: any = {
        usuario_id: userId,
        nombre: {
          contains: query,
          mode: 'insensitive',
        },
      };

      if (tipo) {
        where.tipo = tipo;
      }

      const files = await this.prisma.archivo_sd.findMany({
        where,
        orderBy: {
          indexado_en: 'desc',
        },
        take: 50,
      });

      return {
        count: files.length,
        files: files.map((f) => ({
          id: f.id,
          nombre: f.nombre,
          ruta: f.ruta_completa,
          tipo: f.tipo,
          extension: f.extension,
          tamano: f.tamano_bytes ? Number(f.tamano_bytes) : null,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to search files: ${error.message}`);
      throw error;
    }
  }

  /**
   * List files by type
   */
  async listFilesByType(userId: string, tipo: string, limit: number = 50) {
    try {
      const files = await this.prisma.archivo_sd.findMany({
        where: {
          usuario_id: userId,
          tipo,
        },
        orderBy: {
          fecha_modificacion: 'desc',
        },
        take: limit,
      });

      return {
        tipo,
        count: files.length,
        files: files.map((f) => ({
          id: f.id,
          nombre: f.nombre,
          ruta: f.ruta_completa,
          extension: f.extension,
          tamano: f.tamano_bytes ? Number(f.tamano_bytes) : null,
          fechaModificacion: f.fecha_modificacion,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to list files by type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file statistics
   */
  async getStatistics(userId: string) {
    try {
      const total = await this.prisma.archivo_sd.count({
        where: { usuario_id: userId },
      });

      const byType = await this.prisma.archivo_sd.groupBy({
        by: ['tipo'],
        where: { usuario_id: userId },
        _count: true,
      });

      return {
        total,
        byType: byType.map((t) => ({
          tipo: t.tipo,
          count: t._count,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear indexed files
   */
  async clearIndex(userId: string) {
    try {
      const result = await this.prisma.archivo_sd.deleteMany({
        where: { usuario_id: userId },
      });

      return {
        success: true,
        message: `Índice limpiado: ${result.count} archivos eliminados`,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(`Failed to clear index: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect file type from extension
   */
  private detectFileType(extension: string): string {
    const ext = extension.toLowerCase().replace('.', '');

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
    const audioExts = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];

    if (imageExts.includes(ext)) return 'imagen';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (docExts.includes(ext)) return 'documento';

    return 'otro';
  }

  /**
   * Extract extension from filename
   */
  private extractExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  }
}
