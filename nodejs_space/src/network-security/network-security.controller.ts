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
import { NetworkSecurityService } from './network-security.service';

@ApiTags('🔐 Network Security Monitor')
@Controller('api/v1/network-security')
export class NetworkSecurityController {
  constructor(private readonly networkSecurityService: NetworkSecurityService) {}

  @Post('analyze-wifi')
  @ApiOperation({
    summary: 'Analizar seguridad del WiFi',
    description:
      'Verifica si tu red WiFi es segura (WPA3, WPA2) o insegura (WEP, Abierta). ARGOS te avisa si necesitas VPN',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        nombreWifi: { type: 'string', example: 'Mi Red 5G' },
        nivelSeguridad: {
          type: 'string',
          example: 'WPA2',
          enum: ['WPA3', 'WPA2', 'WEP', 'Abierta'],
        },
      },
      required: ['userId', 'nombreWifi', 'nivelSeguridad'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis completo',
  })
  async analizarWifi(
    @Body()
    body: {
      userId: string;
      nombreWifi: string;
      nivelSeguridad: string;
    },
  ) {
    try {
      if (
        !body.userId ||
        !body.nombreWifi ||
        !body.nivelSeguridad
      ) {
        throw new HttpException(
          'Faltan campos requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.networkSecurityService.analizarWifi(
        body.userId,
        body.nombreWifi,
        body.nivelSeguridad,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error analizando WiFi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('check-phishing')
  @ApiOperation({
    summary: 'Detectar phishing',
    description:
      'Verifica si un sitio web es conocido como phishing. Ejemplo: "ARGOS, ¾s seguro paypal-verify.com?"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        sitio: { type: 'string', example: 'paypal.com' },
      },
      required: ['userId', 'sitio'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Versión completada',
  })
  async detectarPhishing(
    @Body() body: { userId: string; sitio: string },
  ) {
    try {
      if (!body.userId || !body.sitio) {
        throw new HttpException(
          'userId y sitio son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.networkSecurityService.detectarPhishing(
        body.userId,
        body.sitio,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error detectando phishing',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('vpn-recommendation')
  @ApiOperation({
    summary: 'Obtener recomendación de VPN',
    description: 'ARGOS te recomienda si necesitas usar VPN basándose en tu historial de red',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendación generada',
  })
  async obtenerRecomendacionVPN(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.networkSecurityService.obtenerRecomendacionVPN(
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo recomendación',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Obtener historial de monitoreo',
    description: 'Lista todas las conexiones WiFi y sitios analizados',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido',
  })
  async obtenerHistorial(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.networkSecurityService.obtenerHistorialMonitoreo(
        userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo historial',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}