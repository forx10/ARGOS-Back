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
import { TasksService } from './tasks.service';

@ApiTags('✅ Task Manager (Gestor de Tareas)')
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('add')
  @ApiOperation({
    summary: 'Agregar una nueva tarea',
    description:
      'Agrega una tarea a tu lista de pendientes. Ejemplo: "ARGOS, agrega tarea: hacer ejercicio, alta prioridad"',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        titulo: { type: 'string', example: 'Hacer ejercicio' },
        descripcion: { type: 'string', example: '30 minutos de cardio' },
        prioridad: {
          type: 'string',
          example: 'alta',
          enum: ['baja', 'media', 'alta'],
          default: 'media',
        },
        ubicacion: { type: 'string', example: 'Gimnasio' },
        fechaVencimiento: { type: 'string', example: '2024-04-15' },
      },
      required: ['userId', 'titulo'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea agregada exitosamente',
  })
  async agregarTarea(
    @Body()
    body: {
      userId: string;
      titulo: string;
      descripcion?: string;
      prioridad?: string;
      ubicacion?: string;
      fechaVencimiento?: string;
    },
  ) {
    try {
      if (!body.userId || !body.titulo) {
        throw new HttpException(
          'userId y titulo son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.tasksService.agregarTarea(
        body.userId,
        body.titulo,
        body.descripcion,
        body.prioridad || 'media',
        body.ubicacion,
        body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error agregando tarea',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  @ApiOperation({
    summary: 'Obtener todas las tareas',
    description: 'Lista todas las tareas pendientes, ordenadas por prioridad y fecha',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiQuery({
    name: 'soloActivas',
    type: Boolean,
    required: false,
    example: true,
    default: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas obtenidas',
  })
  async obtenerTareas(
    @Query('userId') userId: string,
    @Query('soloActivas') soloActivas: string = 'true',
  ) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      return await this.tasksService.obtenerTareas(
        userId,
        soloActivas === 'true',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo tareas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete/:tareaId')
  @ApiOperation({
    summary: 'Marcar tarea como completada',
    description: 'Marca una tarea como hecha',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea completada',
  })
  async completarTarea(
    @Param('tareaId') tareaId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !tareaId) {
        throw new HttpException(
          'userId y tareaId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.tasksService.completarTarea(
        userId,
        parseInt(tareaId),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error completando tarea',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:tareaId')
  @ApiOperation({
    summary: 'Eliminar una tarea',
    description: 'Elimina una tarea de la lista',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea eliminada',
  })
  async eliminarTarea(
    @Param('tareaId') tareaId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !tareaId) {
        throw new HttpException(
          'userId y tareaId son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.tasksService.eliminarTarea(
        userId,
        parseInt(tareaId),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error eliminando tarea',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('location/:ubicacion')
  @ApiOperation({
    summary: 'Obtener tareas por ubicación',
    description: 'Obtiene tareas asociadas a una ubicación específica',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas obtenidas',
  })
  async obtenerTareasPorUbicacion(
    @Param('ubicacion') ubicacion: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId || !ubicacion) {
        throw new HttpException(
          'userId y ubicacion son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.tasksService.obtenerTareasPorUbicacion(
        userId,
        ubicacion,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo tareas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reminder-voice')
  @ApiOperation({
    summary: 'Obtener recordatorio de voz',
    description: 'Genera un recordatorio hablado con tus tareas pendientes',
  })
  @ApiQuery({
    name: 'userId',
    type: String,
    example: 'usuario_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio generado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        recordatorio: { type: 'string' },
      },
    },
  })
  async obtenerRecordatorioVoz(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('userId es requerido', HttpStatus.BAD_REQUEST);
      }

      const recordatorio = await this.tasksService.obtenerRecordatorioVoz(
        userId,
      );

      return {
        success: true,
        recordatorio,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error obteniendo recordatorio',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('priority/:tareaId')
  @ApiOperation({
    summary: 'Actualizar prioridad de una tarea',
    description: 'Cambia la prioridad de una tarea (baja, media, alta)',
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
        prioridad: { type: 'string', example: 'alta', enum: ['baja', 'media', 'alta'] },
      },
      required: ['prioridad'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Prioridad actualizada',
  })
  async actualizarPrioridad(
    @Param('tareaId') tareaId: string,
    @Query('userId') userId: string,
    @Body() body: { prioridad: string },
  ) {
    try {
      if (!userId || !tareaId || !body.prioridad) {
        throw new HttpException(
          'userId, tareaId y prioridad son requeridos',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.tasksService.actualizarPrioridad(
        userId,
        parseInt(tareaId),
        body.prioridad,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error actualizando prioridad',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}