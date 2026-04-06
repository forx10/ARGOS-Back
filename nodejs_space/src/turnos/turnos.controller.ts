import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

@ApiTags('Turnos')
@Controller('api/turnos')
export class TurnosController {
  private readonly logger = new Logger(TurnosController.name);

  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo turno' })
  @ApiResponse({
    status: 201,
    description: 'Turno creado exitosamente',
    schema: {
      properties: {
        id: { type: 'number' },
        usuario_id: { type: 'string' },
        hora_inicio: { type: 'string', example: '06:00' },
        hora_fin: { type: 'string', example: '14:00' },
        tipo_turno: { type: 'string', example: '6AM-2PM' },
        fecha: { type: 'string', format: 'date' },
        activo: { type: 'boolean' },
      },
    },
  })
  async crearTurno(@Body() createTurnoDto: CreateTurnoDto) {
    this.logger.log(`POST /api/turnos - Creando turno para usuario ${createTurnoDto.usuario_id}`);
    const turno = await this.turnosService.crearTurno(createTurnoDto);
    return {
      success: true,
      data: turno,
      message: 'Turno creado exitosamente',
    };
  }

  @Get(':usuarioId/analizar')
  @ApiOperation({ summary: 'Analizar turnos y generar órdenes automáticas' })
  @ApiResponse({
    status: 200,
    description: 'Análisis de turnos completado',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          properties: {
            turnoActual: { type: 'object' },
            proximoTurno: { type: 'object' },
            horaAlarma: { type: 'string' },
            bloqueoActivo: { type: 'object' },
            mensaje: { type: 'string' },
          },
        },
      },
    },
  })
  async analizarTurnos(
    @Param('usuarioId') usuarioId: string,
  ) {
    this.logger.log(`GET /api/turnos/:usuarioId/analizar - Analizando turnos para ${usuarioId}`);

    // Apps y sitios por defecto
    const appsDefault = ['Instagram', 'TikTok', 'YouTube'];
    const sitiosDefault = ['pornografia.com', 'porn*.com', 'xxx*.com']; // Patrones

    const resultado = await this.turnosService.analizarYGenerarOrdenes(
      usuarioId,
      appsDefault,
      sitiosDefault,
    );

    return {
      success: true,
      data: resultado,
    };
  }

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Obtener turnos próximos del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de turnos próximos',
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
  async obtenerTurnosUsuario(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/turnos/:usuarioId - Obteniendo turnos para ${usuarioId}`);
    const turnos = await this.turnosService.obtenerTurnosUsuario(usuarioId);
    return {
      success: true,
      data: turnos,
    };
  }
}
