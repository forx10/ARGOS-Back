import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FocusModeService } from './focus-mode.service';

@ApiTags('📄 Focus Mode (Modo Concentración)')
@Controller('api/v1/focus-mode')
export class FocusModeController {
  constructor(private readonly focusModeService: FocusModeService) {}

  @Post('activate')
  @ApiOperation({
    summary: 'Activar Focus Mode',
    description:
      'Activa el modo de concentración que bloquea apps/sitios por X tiempo. LAS LLAMADAS SIEMPRE FUNCIONAN. Ejemplo: "ARGOS, Focus Mode 2 horas para estudiar"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        duracionMinutos: { type: 'number', example: 120 },
        appsABloquear: {
          type: 'array',
          items: { type: 'string' },
          example: ['com.instagram.android', 'com.tiktok', 'com.facebook.katana'],
        },
        sitiosABloquear: {
          type: 'array',
          items: { type: 'string' },
          example: ['youtube.com', 'twitter.com', 'reddit.com'],
        },
        motivo: { type: 'string', example: 'estudio', default: 'concentracion' },
      },
      required: ['userId', 'duracionMinutos'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Focus Mode activado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        sesion: { type: 'object' },
      },
    },
  })
  async activarFocusMode(
    @Body()
    body: {
      userId: string;
      duracionMinutos: number;
      appsABloquear?: string[];
      sitiosABloquear?: string[];
      motivo?: string;
    },
  ) {
    try {
      if (!body.userId || !body.duracionMinutos) {
        throw new HttpException(
          'userId y duracionMinutos son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.focusModeService.activarFocusMode(
        body.userId,
        body.duracionMinutos,
        body.appsABloquear || [],
        body.sitiosABloquear || [],
        body.motivo || 'concentracion',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error activando Focus Mode',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('current')
  @ApiOperation({
    summary: 'Obtener sesión actual',
    description: 'Obtiene información sobre la sesión de Focus Mode activa',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión obtenida',
  })
  async obtenerSesionActual(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'userId es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.focusModeService.obtenerSesionActual(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo sesión',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete/:sesionId')
  @ApiOperation({
    summary: 'Completar Focus Mode',
    description: 'Termina la sesión de Focus Mode y muestra estadísticas',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión completada',
  })
  async completarFocusMode(
    @Param('sesionId') sesionId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !sesionId) {
        throw new HttpException(
          'userId y sesionId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.focusModeService.completarFocusMode(
        userId,
        parseInt(sesionId),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error completando Focus Mode',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas',
    description: 'Muestra estadísticas de todas las sesiones de Focus Mode completadas',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
  })
  async obtenerEstadisticas(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'userId es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.focusModeService.obtenerEstadisticas(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo estadísticas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('allowed-apps')
  @ApiOperation({
    summary: 'Obtener apps que SIEMPRE pueden hacer llamadas',
    description:
      'Lista las apps que NUNCA se bloquean incluso en Focus Mode (llamadas, WhatsApp calls, etc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de apps desbloqueadas obtenida',
  })
  async obtenerAppsDesbloqueadas() {
    try {
      return {
        success: true,
        mensaje:
          '📞 Estas apps SIEMPRE pueden hacer llamadas, incluso en Focus Mode',
        appsPueden:
          this.focusModeService.obtenerAppsDesbloqueadas(),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}