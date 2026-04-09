import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GeofencingService } from './geofencing.service';

@ApiTags('📍 Geofencing & Recordatorios por Ubicación')
@Controller('api/v1/geofencing')
export class GeofencingController {
  constructor(private readonly geofencingService: GeofencingService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Crear un geofence',
    description:
      'Crea una ubicación (Casa, Gimnasio, Trabajo) con recordatorios automáticos. Ejemplo: "ARGOS, agrega geofence Casa con recordatorios: comer, organizar, estudiar"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        nombre: { type: 'string', example: 'Casa' },
        latitud: { type: 'number', example: 4.7110 },
        longitud: { type: 'number', example: -74.0721 },
        recordatorios: {
          type: 'array',
          items: { type: 'string' },
          example: ['comer', 'organizar', 'estudiar'],
        },
        radio: { type: 'number', example: 500, default: 500 },
        tipoBloqueo: { type: 'string', example: 'focus' },
        duracionBloqueo: { type: 'number', example: 60 },
      },
      required: ['userId', 'nombre', 'latitud', 'longitud'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Geofence creado exitosamente',
  })
  async crearGeofence(
    @Body()
    body: {
      userId: string;
      nombre: string;
      latitud: number;
      longitud: number;
      recordatorios?: string[];
      radio?: number;
      tipoBloqueo?: string;
      duracionBloqueo?: number;
    },
  ) {
    try {
      if (!body.userId || !body.nombre || body.latitud === undefined || body.longitud === undefined) {
        throw new HttpException(
          'Faltan campos requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.geofencingService.crearGeofence(
        body.userId,
        body.nombre,
        body.latitud,
        body.longitud,
        body.recordatorios || [],
        body.radio || 500,
        body.tipoBloqueo,
        body.duracionBloqueo,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creando geofence',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  @ApiOperation({
    summary: 'Obtener todos los geofences',
    description: 'Lista todos los geofences creados por el usuario',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Geofences obtenidos exitosamente',
  })
  async obtenerGeofences(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.geofencingService.obtenerGeofences(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo geofences',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('detect')
  @ApiOperation({
    summary: 'Detectar si estás dentro de un geofence',
    description:
      'Verifica tu ubicación actual contra todos los geofences y genera recordatorios automáticos',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        latitud: { type: 'number', example: 4.7110 },
        longitud: { type: 'number', example: -74.0721 },
      },
      required: ['userId', 'latitud', 'longitud'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Detección completada',
  })
  async detectarGeofence(
    @Body()
    body: {
      userId: string;
      latitud: number;
      longitud: number;
    },
  ) {
    try {
      if (!body.userId || body.latitud === undefined || body.longitud === undefined) {
        throw new HttpException(
          'userId, latitud y longitud son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.geofencingService.detectarGeofence(
        body.userId,
        body.latitud,
        body.longitud,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error detectando geofence',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('recordatorios/:geofenceId')
  @ApiOperation({
    summary: 'Actualizar recordatorios de un geofence',
    description:
      'Actualiza la lista de recordatorios para una ubicación específica',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recordatorios: {
          type: 'array',
          items: { type: 'string' },
          example: ['hacer ejercicio', 'ducharse', 'descansar'],
        },
      },
      required: ['recordatorios'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorios actualizados',
  })
  async actualizarRecordatorios(
    @Param('geofenceId') geofenceId: string,
    @Query('userId') userId: string,
    @Body() body: { recordatorios: string[] },
  ) {
    try {
      if (!userId || !geofenceId || !body.recordatorios) {
        throw new HttpException(
          'Faltan campos requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.geofencingService.actualizarRecordatorios(
        userId,
        parseInt(geofenceId),
        body.recordatorios,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error actualizando recordatorios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:geofenceId')
  @ApiOperation({
    summary: 'Eliminar un geofence',
    description: 'Elimina una ubicación y sus recordatorios asociados',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Geofence eliminado',
  })
  async eliminarGeofence(
    @Param('geofenceId') geofenceId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !geofenceId) {
        throw new HttpException(
          'userId y geofenceId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.geofencingService.eliminarGeofence(
        userId,
        parseInt(geofenceId),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error eliminando geofence',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}