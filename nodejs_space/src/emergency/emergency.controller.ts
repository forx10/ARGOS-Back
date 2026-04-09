import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';

@ApiTags('🚨 Emergency SOS')
@Controller('api/v1/emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('contact/add')
  @ApiOperation({
    summary: 'Agregar contacto de emergencia',
    description:
      'Agrega un nuevo contacto para ser llamado en situaciones de emergencia. Ejemplo: "ARGOS, agregar a Manuel como contacto de emergencia"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        nombre: { type: 'string', example: 'Manuel' },
        telefono: { type: 'string', example: '+573001234567' },
        tipo: { type: 'string', example: 'familia', default: 'familia' },
      },
      required: ['userId', 'nombre', 'telefono'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contacto agregado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        contacto: { type: 'object' },
      },
    },
  })
  async agregarContacto(
    @Body()
    body: {
      userId: string;
      nombre: string;
      telefono: string;
      tipo?: string;
    },
  ) {
    try {
      if (!body.userId || !body.nombre || !body.telefono) {
        throw new HttpException(
          'Faltan campos requeridos: userId, nombre, telefono',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.agregarContactoEmergencia(
        body.userId,
        body.nombre,
        body.telefono,
        body.tipo || 'familia',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error agregando contacto',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contacts')
  @ApiOperation({
    summary: 'Obtener contactos de emergencia',
    description: 'Lista todos los contactos de emergencia registrados',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    description: 'ID del usuario',
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Contactos obtenidos exitosamente',
  })
  async obtenerContactos(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'userId es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.obtenerContactosEmergencia(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo contactos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('contact/:contactoId')
  @ApiOperation({
    summary: 'Eliminar contacto de emergencia',
    description: 'Elimina un contacto de emergencia',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacto eliminado exitosamente',
  })
  async eliminarContacto(
    @Param('contactoId') contactoId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !contactoId) {
        throw new HttpException(
          'userId y contactoId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.eliminarContactoEmergencia(
        userId,
        parseInt(contactoId),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error eliminando contacto',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sos/activate')
  @ApiOperation({
    summary: 'Activar modo SOS de emergencia',
    description:
      'Activa el modo SOS para emergencias. Llama a contactos, envía WhatsApp si no contestan, y graba audio. Ej: "ARGOS emergencia", "ARGOS ayuda", "ARGOS policía"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        latitud: { type: 'number', example: 4.7110 },
        longitud: { type: 'number', example: -74.0721 },
        tipoEmergencia: {
          type: 'string',
          example: 'robo',
          default: 'emergencia general',
        },
      },
      required: ['userId', 'latitud', 'longitud'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'SOS activado - Llamadas y mensajes iniciados',
  })
  async activarSOS(
    @Body()
    body: {
      userId: string;
      latitud: number;
      longitud: number;
      tipoEmergencia?: string;
    },
  ) {
    try {
      if (!body.userId || body.latitud === undefined || body.longitud === undefined) {
        throw new HttpException(
          'Faltan campos: userId, latitud, longitud',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.activarSOS(
        body.userId,
        body.latitud,
        body.longitud,
        body.tipoEmergencia || 'emergencia general',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error activando SOS',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sos/cancel')
  @ApiOperation({
    summary: 'Cancelar SOS',
    description: 'Cancela un SOS activo si el usuario lo desactiva manualmente',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        incidenteId: { type: 'number', example: 1 },
      },
      required: ['userId', 'incidenteId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'SOS cancelado exitosamente',
  })
  async cancelarSOS(
    @Body() body: { userId: string; incidenteId: number },
  ) {
    try {
      if (!body.userId || !body.incidenteId) {
        throw new HttpException(
          'userId e incidenteId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.cancelarSOS(
        body.userId,
        body.incidenteId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error cancelando SOS',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sos/history')
  @ApiOperation({
    summary: 'Obtener historial de SOSs',
    description: 'Lista los últimos incidentes de emergencia registrados',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de SOSs obtenido exitosamente',
  })
  async obtenerHistorial(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException(
          'userId es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.emergencyService.obtenerHistorialSOS(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo historial',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}