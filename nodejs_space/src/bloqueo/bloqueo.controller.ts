import { Controller, Post, Get, Delete, Body, Param, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BloqueoService } from './bloqueo.service';
import { CreateBloqueoDto } from './dto/create-bloqueo.dto';

@ApiTags('Bloqueo')
@Controller('api/bloqueo')
export class BloqueoController {
  private readonly logger = new Logger(BloqueoController.name);

  constructor(private readonly bloqueoService: BloqueoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear bloqueo de apps/sitios' })
  @ApiResponse({
    status: 201,
    description: 'Bloqueo creado exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          properties: {
            bloqueo: { type: 'object' },
            taskerStatus: { type: 'string' },
          },
        },
      },
    },
  })
  async crearBloqueo(@Body() createBloqueoDto: CreateBloqueoDto) {
    this.logger.log(`POST /api/bloqueo - Usuario: ${createBloqueoDto.usuario_id}`);
    const resultado = await this.bloqueoService.crearBloqueo(createBloqueoDto);
    return {
      success: true,
      data: resultado,
      message: 'Bloqueo creado y comando enviado a Tasker',
    };
  }

  @Delete(':bloqueoId')
  @ApiOperation({ summary: 'Desbloquear (terminar bloqueo)' })
  @ApiResponse({
    status: 200,
    description: 'Bloqueo completado',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async desbloquear(@Param('bloqueoId', ParseIntPipe) bloqueoId: number) {
    this.logger.log(`DELETE /api/bloqueo/:bloqueoId - ID: ${bloqueoId}`);
    const bloqueo = await this.bloqueoService.desbloquear(bloqueoId);
    return {
      success: true,
      data: bloqueo,
      message: 'Bloqueo completado y comando de desbloqueo enviado a Tasker',
    };
  }

  @Get(':usuarioId/activos')
  @ApiOperation({ summary: 'Obtener bloqueos activos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de bloqueos activos',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  async obtenerBloqueoActivos(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/bloqueo/:usuarioId/activos - Usuario: ${usuarioId}`);
    const bloqueos = await this.bloqueoService.obtenerBloqueoActivos(usuarioId);
    return {
      success: true,
      data: bloqueos,
    };
  }
}
