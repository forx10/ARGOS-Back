import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { DeviceDiagnosticsService } from './device-diagnostics.service';

@ApiTags('🔧 Device Diagnostics & Optimization')
@Controller('api/v1/device-diagnostics')
export class DeviceDiagnosticsController {
  constructor(
    private readonly deviceDiagnosticsService: DeviceDiagnosticsService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar diagnóstico del dispositivo',
    description:
      'Registra métricas del dispositivo (RAM, CPU, batería, temperatura). ARGOS detecta automáticamente problemas y sugiere soluciones',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        ramTotalMb: { type: 'number', example: 4096 },
        ramDisponibleMb: { type: 'number', example: 512 },
        cpuPorcentaje: { type: 'number', example: 45 },
        temperatura: { type: 'number', example: 38 },
        bateriaPorcent: { type: 'number', example: 75 },
        almacenamientoLibreMb: { type: 'number', example: 2048 },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnóstico registrado',
  })
  async registrarDiagnostico(
    @Body()
    body: {
      userId: string;
      ramTotalMb?: number;
      ramDisponibleMb?: number;
      cpuPorcentaje?: number;
      temperatura?: number;
      bateriaPorcent?: number;
      almacenamientoLibreMb?: bigint;
    },
  ) {
    try {
      if (!body.userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.deviceDiagnosticsService.registrarDiagnostico(
        body.userId,
        body.ramTotalMb,
        body.ramDisponibleMb,
        body.cpuPorcentaje,
        body.temperatura,
        body.bateriaPorcent,
        body.almacenamientoLibreMb,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error registrando diagnóstico',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Obtener último diagnóstico',
    description: 'Obtiene el diagnóstico más reciente del dispositivo',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnóstico obtenido',
  })
  async obtenerUltimoDiagnostico(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.deviceDiagnosticsService.obtenerUltimoDiagnostico(
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo diagnóstico',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Obtener historial de diagnósticos',
    description: 'Lista los últimos diagnósticos registrados',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiQuery({
    name: 'limite',
    type: Number,
    required: false,
    default: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido',
  })
  async obtenerHistorial(
    @Query('userId') userId: string,
    @Query('limite') limite: string = '10',
  ) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.deviceDiagnosticsService.obtenerHistorial(
        userId,
        parseInt(limite),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo historial',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'Obtener recomendaciones de optimización',
    description: 'ARGOS sugiere cómo optimizar tu dispositivo basado en el diagnóstico',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendaciones obtenidas',
  })
  async obtenerRecomendaciones(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      const recomendaciones =
        await this.deviceDiagnosticsService.obtenerRecomendacionesOptimizacion(
          userId,
        );

      return {
        success: true,
        recomendaciones,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo recomendaciones',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('clear-cache')
  @ApiOperation({
    summary: 'Limpiar caché del dispositivo',
    description: 'Limpia archivos temporales y caché para liberar espacio y mejorar rendimiento',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Caché limpiado',
  })
  async limpiarCache(@Body() body: { userId: string }) {
    try {
      if (!body.userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.deviceDiagnosticsService.limpiarCache(body.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error limpiando caché',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}