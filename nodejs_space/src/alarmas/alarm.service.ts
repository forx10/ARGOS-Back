import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearAlarmaDto } from './dto/crear-alarma.dto';

@Injectable()
export class AlarmService {
  private readonly logger = new Logger(AlarmService.name);

  constructor(private prisma: PrismaService) {}

  async crearAlarma(dto: CrearAlarmaDto) {
    const alarma = await this.prisma.alarmas.create({
      data: {
        usuario_id: dto.usuarioId,
        timestamp: dto.timestamp,
        tipo: dto.tipo,
        mensaje: dto.mensaje,
        metadata: dto.metadata || {},
        ejecutada: false,
      },
    });

    this.logger.log(
      `Alarma creada: ID ${alarma.id}, timestamp ${alarma.timestamp}`,
    );

    return alarma;
  }

  async listarPendientes(usuarioId: string) {
    return this.prisma.alarmas.findMany({
      where: {
        usuario_id: usuarioId,
        ejecutada: false,
        timestamp: {
          gte: new Date(),
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }

  async cancelarAlarma(id: number) {
    await this.prisma.alarmas.delete({
      where: { id },
    });

    this.logger.log(`Alarma cancelada: ID ${id}`);

    return {
      exito: true,
      mensaje: 'Alarma cancelada',
    };
  }

  async verificarYEjecutarAlarmas() {
    const ahora = new Date();

    // Buscar alarmas vencidas
    const alarmasVencidas = await this.prisma.alarmas.findMany({
      where: {
        ejecutada: false,
        timestamp: {
          lte: ahora,
        },
      },
    });

    this.logger.log(`Alarmas vencidas encontradas: ${alarmasVencidas.length}`);

    const resultados = [];

    for (const alarma of alarmasVencidas) {
      try {
        await this.ejecutarAlarma(alarma);

        // Marcar como ejecutada
        await this.prisma.alarmas.update({
          where: { id: alarma.id },
          data: { ejecutada: true },
        });

        resultados.push({
          id: alarma.id,
          tipo: alarma.tipo,
          exito: true,
        });
      } catch (error) {
        this.logger.error(
          `Error ejecutando alarma ${alarma.id}: ${error.message}`,
        );
        resultados.push({
          id: alarma.id,
          tipo: alarma.tipo,
          exito: false,
          error: error.message,
        });
      }
    }

    return {
      alarmasVerificadas: alarmasVencidas.length,
      resultados,
    };
  }

  private async ejecutarAlarma(alarma: any) {
    this.logger.log(`Ejecutando alarma ID ${alarma.id}, tipo ${alarma.tipo}`);

    const taskerWebhookUrl = process.env.TASKER_WEBHOOK_URL;

    if (!taskerWebhookUrl) {
      throw new Error('TASKER_WEBHOOK_URL no configurado');
    }

    let mensaje = '';

    switch (alarma.tipo) {
      case 'recordatorio':
        mensaje = alarma.mensaje || 'Recordatorio de ARGOS';
        break;

      case 'bloqueo':
        mensaje = `BLOQUEAR_APPS:${JSON.stringify(alarma.metadata)}`;
        break;

      case 'turno':
        mensaje = `ACTIVAR_TURNO:${alarma.metadata.turno_id}`;
        break;
    }

    // Enviar a Tasker
    const url = taskerWebhookUrl.replace('%s', encodeURIComponent(mensaje));

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Tasker webhook fallo: ${response.statusText}`);
    }

    this.logger.log(`Alarma ${alarma.id} ejecutada y enviada a Tasker`);
  }
}
