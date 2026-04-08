import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AlarmService } from './alarm.service';
import { CrearAlarmaDto } from './dto/crear-alarma.dto';

@ApiTags('Alarmas')
@Controller('api/alarmas')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear alarma programada',
    description:
      'Crea una alarma para ejecutar en el futuro. Puede ser recordatorio, activación de turno, o bloqueo programado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Alarma creada exitosamente',
  })
  async crearAlarma(@Body() dto: CrearAlarmaDto) {
    return this.alarmService.crearAlarma(dto);
  }

  @Get('pendientes/:usuarioId')
  @ApiOperation({
    summary: 'Listar alarmas pendientes',
    description: 'Obtiene todas las alarmas futuras del usuario',
  })
  async listarPendientes(@Param('usuarioId') usuarioId: string) {
    return this.alarmService.listarPendientes(usuarioId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar alarma',
    description: 'Cancela una alarma programada',
  })
  async cancelarAlarma(@Param('id') id: number) {
    return this.alarmService.cancelarAlarma(id);
  }

  @Get('verificar')
  @ApiOperation({
    summary: 'Verificar alarmas vencidas',
    description:
      'Endpoint para cron job que verifica y ejecuta alarmas vencidas. Se ejecuta cada 5 minutos.',
  })
  async verificarAlarmas() {
    return this.alarmService.verificarYEjecutarAlarmas();
  }
}
