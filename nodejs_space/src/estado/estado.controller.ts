import { Controller, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EstadoService } from './estado.service';

@ApiTags('Estado')
@Controller('api/estado')
export class EstadoController {
  private readonly logger = new Logger(EstadoController.name);

  constructor(private readonly estadoService: EstadoService) {}

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Obtener estado completo del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Estado completo: bloqueos activos, turnos próximos, alarmas',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          properties: {
            usuario_id: { type: 'string' },
            bloqueos_activos: { type: 'array' },
            turno_actual: { type: 'object' },
            proximo_turno: { type: 'object' },
            proximaAlarma: { type: 'string' },
            resumen: { type: 'string' },
          },
        },
      },
    },
  })
  async obtenerEstado(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/estado/:usuarioId - Usuario: ${usuarioId}`);
    const estado = await this.estadoService.obtenerEstadoCompleto(usuarioId);
    return {
      success: true,
      data: estado,
    };
  }

  @Get(':usuarioId/bloqueos')
  @ApiOperation({ summary: 'Obtener solo bloqueos activos' })
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
  async obtenerBloqueos(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/estado/:usuarioId/bloqueos`);
    const bloqueos = await this.estadoService.obtenerBloqueoActivos(usuarioId);
    return {
      success: true,
      data: bloqueos,
    };
  }

  @Get(':usuarioId/turnos')
  @ApiOperation({ summary: 'Obtener próximos turnos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de próximos turnos (7 días)',
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
  async obtenerTurnos(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/estado/:usuarioId/turnos`);
    const turnos = await this.estadoService.obtenerProximosTurnos(usuarioId, 7);
    return {
      success: true,
      data: turnos,
    };
  }

  @Get('sitios/bloqueados')
  @ApiOperation({ summary: 'Obtener lista de sitios bloqueados por categoría' })
  @ApiResponse({
    status: 200,
    description: 'Lista de sitios bloqueados',
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
  async obtenerSitiosBloqueados() {
    this.logger.log(`GET /api/estado/sitios/bloqueados`);
    const sitios = await this.estadoService.obtenerSitiosBloqueados();
    return {
      success: true,
      data: sitios,
    };
  }
}
