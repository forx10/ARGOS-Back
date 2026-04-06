import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueoDto } from './dto/create-bloqueo.dto';
import { bloqueo_activo } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class BloqueoService {
  private readonly logger = new Logger(BloqueoService.name);
  private readonly taskerWebhookUrl = process.env.TASKER_WEBHOOK_URL || '';

  constructor(private prisma: PrismaService) {}

  /**
   * Crear bloqueo y enviar comando a Tasker
   */
  async crearBloqueo(createBloqueoDto: CreateBloqueoDto): Promise<{
    bloqueo: bloqueo_activo;
    taskerStatus: string;
  }> {
    if (!createBloqueoDto.duracion_minutos || createBloqueoDto.duracion_minutos <= 0) {
      throw new BadRequestException('La duración debe ser mayor a 0 minutos');
    }

    this.logger.log(
      `Creando bloqueo para usuario ${createBloqueoDto.usuario_id}: ${createBloqueoDto.apps_bloqueadas.join(', ')}`,
    );

    const tiempoFin = new Date();
    tiempoFin.setMinutes(tiempoFin.getMinutes() + createBloqueoDto.duracion_minutos);

    // Crear registro en BD
    const bloqueo = await this.prisma.bloqueo_activo.create({
      data: {
        usuario_id: createBloqueoDto.usuario_id,
        apps_bloqueadas: createBloqueoDto.apps_bloqueadas,
        sitios_bloqueados: createBloqueoDto.sitios_bloqueados,
        tiempo_fin: tiempoFin,
        estado: 'activo',
        razon: createBloqueoDto.razon || 'manual',
      },
    });

    // Enviar comando a Tasker
    const taskerStatus = await this.enviarComandoTasker(createBloqueoDto, bloqueo.id);

    return {
      bloqueo,
      taskerStatus,
    };
  }

  /**
   * Enviar payload a Tasker vía AutoRemote webhook
   */
  private async enviarComandoTasker(
    createBloqueoDto: CreateBloqueoDto,
    bloqueoId: number,
  ): Promise<string> {
    if (!this.taskerWebhookUrl) {
      this.logger.warn('TASKER_WEBHOOK_URL no configurada');
      return 'webhook_no_configurado';
    }

    try {
      const payload = {
        accion: 'bloquear',
        usuario_id: createBloqueoDto.usuario_id,
        bloqueo_id: bloqueoId,
        apps: createBloqueoDto.apps_bloqueadas,
        sitios: createBloqueoDto.sitios_bloqueados,
        duracion_minutos: createBloqueoDto.duracion_minutos,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Enviando comando a Tasker: ${JSON.stringify(payload)}`);

      const response = await axios.post(this.taskerWebhookUrl, payload, {
        timeout: 5000,
      });

      this.logger.log(`Respuesta de Tasker: ${response.status}`);
      return 'enviado';
    } catch (error) {
      this.logger.error(
        `Error al enviar comando a Tasker: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return 'error_envio';
    }
  }

  /**
   * Desbloquear apps/sitios (terminar bloqueo)
   */
  async desbloquear(bloqueoId: number): Promise<bloqueo_activo> {
    this.logger.log(`Desbloqueando bloqueo_id: ${bloqueoId}`);

    const bloqueo = await this.prisma.bloqueo_activo.update({
      where: { id: bloqueoId },
      data: {
        estado: 'completado',
        tiempo_fin: new Date(), // Terminar inmediatamente
      },
    });

    // Enviar comando de desbloqueo a Tasker
    await this.enviarComandoDesbloqueoTasker(bloqueo);

    return bloqueo;
  }

  /**
   * Enviar comando de desbloqueo a Tasker
   */
  private async enviarComandoDesbloqueoTasker(bloqueo: bloqueo_activo): Promise<void> {
    if (!this.taskerWebhookUrl) {
      this.logger.warn('TASKER_WEBHOOK_URL no configurada para desbloqueo');
      return;
    }

    try {
      const payload = {
        accion: 'desbloquear',
        usuario_id: bloqueo.usuario_id,
        bloqueo_id: bloqueo.id,
        apps: bloqueo.apps_bloqueadas,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Enviando desbloqueo a Tasker: ${JSON.stringify(payload)}`);

      await axios.post(this.taskerWebhookUrl, payload, {
        timeout: 5000,
      });

      this.logger.log(`Desbloqueo enviado a Tasker`);
    } catch (error) {
      this.logger.error(
        `Error al enviar desbloqueo a Tasker: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Obtener bloqueos activos de un usuario
   */
  async obtenerBloqueoActivos(usuarioId: string): Promise<bloqueo_activo[]> {
    const ahora = new Date();

    return this.prisma.bloqueo_activo.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'activo',
        tiempo_fin: {
          gt: ahora,
        },
      },
      orderBy: {
        tiempo_inicio: 'desc',
      },
    });
  }

  /**
   * Obtener bloqueo por ID
   */
  async obtenerBloqueoById(bloqueoId: number): Promise<bloqueo_activo | null> {
    return this.prisma.bloqueo_activo.findUnique({
      where: { id: bloqueoId },
    });
  }
}
