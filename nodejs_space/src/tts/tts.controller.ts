import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { TtsService } from './tts.service';

class GenerarAudioDto {
  texto: string;
  vozId?: string;
}

@ApiTags('TTS')
@Controller('api/tts')
export class TtsController {
  private readonly logger = new Logger(TtsController.name);

  constructor(private readonly ttsService: TtsService) {}

  @Get('voces')
  @ApiOperation({
    summary: 'Listar voces disponibles',
    description: 'Retorna todas las voces disponibles para síntesis de voz',
  })
  listarVoces() {
    return {
      ok: true,
      voces: this.ttsService.listarVoces(),
    };
  }

  @Post('generar')
  @ApiOperation({
    summary: 'Generar audio MP3 a partir de texto',
    description:
      'Genera un archivo de audio MP3 con la voz seleccionada y retorna una URL para descargarlo',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        texto: {
          type: 'string',
          description: 'Texto a convertir en audio',
          example: 'Hola Luis, ¿en qué puedo ayudarte hoy?',
        },
        vozId: {
          type: 'string',
          description:
            'ID de la voz (jarvis, gonzalo, alvaro, jorge, salome, elvira, dalia). Default: jarvis',
          example: 'jarvis',
        },
      },
      required: ['texto'],
    },
  })
  async generarAudio(@Body() dto: GenerarAudioDto) {
    if (!dto.texto || dto.texto.trim().length === 0) {
      throw new HttpException('El texto es requerido', HttpStatus.BAD_REQUEST);
    }

    try {
      const resultado = await this.ttsService.generarAudio(
        dto.texto,
        dto.vozId || 'jarvis',
      );
      return {
        ok: true,
        ...resultado,
      };
    } catch (error) {
      this.logger.error(`Error generando audio: ${error.message}`);
      throw new HttpException(
        `Error generando audio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generar/stream')
  @ApiOperation({
    summary: 'Generar audio MP3 y retornarlo directamente',
    description:
      'Genera audio y lo retorna como stream MP3 directamente en la respuesta',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        texto: { type: 'string', example: 'Bienvenido señor.' },
        vozId: { type: 'string', example: 'jarvis' },
      },
      required: ['texto'],
    },
  })
  async generarAudioStream(
    @Body() dto: GenerarAudioDto,
    @Res() res: Response,
  ) {
    if (!dto.texto || dto.texto.trim().length === 0) {
      throw new HttpException('El texto es requerido', HttpStatus.BAD_REQUEST);
    }

    try {
      const buffer = await this.ttsService.generarAudioBuffer(
        dto.texto,
        dto.vozId || 'jarvis',
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'inline; filename="argos_tts.mp3"',
        'Cache-Control': 'no-cache',
      });

      res.send(buffer);
    } catch (error) {
      this.logger.error(`Error streaming audio: ${error.message}`);
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  @Get('audio/:audioId')
  @ApiOperation({
    summary: 'Descargar audio generado previamente',
    description:
      'Retorna el archivo MP3 generado. El audio permanece disponible por 10 minutos.',
  })
  @ApiParam({
    name: 'audioId',
    description: 'ID del audio generado',
  })
  @ApiResponse({ status: 200, description: 'Audio MP3' })
  @ApiResponse({ status: 404, description: 'Audio no encontrado o expirado' })
  descargarAudio(@Param('audioId') audioId: string, @Res() res: Response) {
    const buffer = this.ttsService.obtenerAudio(audioId);

    if (!buffer) {
      res.status(404).json({
        ok: false,
        error: 'Audio no encontrado o expirado (TTL: 10 minutos)',
      });
      return;
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': 'inline; filename="argos_tts.mp3"',
      'Cache-Control': 'no-cache',
    });

    res.send(buffer);
  }
}
