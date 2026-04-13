import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueoDto, TriggerType } from './dto/create-bloqueo.dto';
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type bloqueo_activo = any;
import axios from 'axios';

@Injectable()
export class BloqueoService {
  private readonly logger = new Logger(BloqueoService.name);
  private readonly taskerWebhookUrl = process.env.TASKER_WEBHOOK_URL || '';

  constructor(private prisma: PrismaService) {}

  /**
   * Crear bloqueo y enviar comando a Tasker
   * Soporta: Comando de voz, Contexto (app abierta), Turno rotativo, Bloqueo manual
   */
  async crearBloqueo(createBloqueoDto: CreateBloqueoDto): Promise<{
    bloqueo: bloqueo_activo;
    taskerStatus: string;
  }> {
    if (!createBloqueoDto.duracion || createBloqueoDto.duracion <= 0) {
      throw new BadRequestException('La duración debe ser mayor a 0 segundos');
    }

    const trigger = createBloqueoDto.trigger || TriggerType.BLOQUEO_MANUAL;

    this.logger.log(
      `[${trigger}] Creando bloqueo para usuario ${createBloqueoDto.usuarioId}: ${createBloqueoDto.appsBloquear.join(', ')}`,
    );

    // Calcular tiempo final basado en duración
    const tiempoFin = new Date();
    tiempoFin.setSeconds(tiempoFin.getSeconds() + createBloqueoDto.duracion);

    // Crear registro en BD
    const bloqueo = await this.prisma.bloqueo_activo.create({
      data: {
        usuario_id: createBloqueoDto.usuarioId,
        apps_bloqueadas: createBloqueoDto.appsBloquear,
        sitios_bloqueados: createBloqueoDto.sitiosBloquear || [],
        tiempo_fin: tiempoFin,
        estado: 'activo',
        razon: createBloqueoDto.razon || trigger,
      },
    });

    // Enviar comando a Tasker con detalles del trigger
    const taskerStatus = await this.enviarComandoTasker(createBloqueoDto, bloqueo.id);

    this.logger.log(
      `Bloqueo creado: ${bloqueo.id} | Tasker Status: ${taskerStatus} | Fin: ${tiempoFin.toISOString()}`,
    );

    return {
      bloqueo,
      taskerStatus,
    };
  }

  /**
   * Enviar payload a Tasker vía AutoRemote webhook con contexto del trigger
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
      const trigger = createBloqueoDto.trigger || TriggerType.BLOQUEO_MANUAL;
      const payload = {
        accion: 'bloquear',
        usuario_id: createBloqueoDto.usuarioId,
        bloqueo_id: bloqueoId,
        trigger: trigger,
        apps: createBloqueoDto.appsBloquear,
        sitios: createBloqueoDto.sitiosBloquear || [],
        duracion_segundos: createBloqueoDto.duracion,
        app_trigger: createBloqueoDto.appTrigger, // Para contexto: app que fue abierta
        comando_voz: createBloqueoDto.comandoVoz, // Para voz: comando que dijo el usuario
        razon: createBloqueoDto.razon,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug(`Payload para Tasker: ${JSON.stringify(payload)}`);

      const response = await axios.post(this.taskerWebhookUrl, payload, {
        timeout: 5000,
      });

      this.logger.log(`✓ Comando enviado a Tasker (Status: ${response.status})`);
      return 'enviado';
    } catch (error) {
      this.logger.error(
        `✗ Error al enviar comando a Tasker: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  /**
   * Desbloquear TODO - quitar todos los bloqueos activos del usuario
   */
  async desbloquearTodo(usuarioId: string): Promise<{
    bloqueosDesactivados: number;
  }> {
    this.logger.log(`Desbloqueando TODO para usuario: ${usuarioId}`);

    // Obtener bloqueos activos
    const bloqueosActivos = await this.prisma.bloqueo_activo.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'activo',
      },
    });

    // Actualizar todos a completado
    await this.prisma.bloqueo_activo.updateMany({
      where: {
        usuario_id: usuarioId,
        estado: 'activo',
      },
      data: {
        estado: 'completado',
        tiempo_fin: new Date(),
      },
    });

    // Enviar comando de desbloqueo global a Tasker
    if (this.taskerWebhookUrl && bloqueosActivos.length > 0) {
      try {
        const payload = {
          accion: 'desbloquear_todo',
          usuario_id: usuarioId,
          bloqueos_desactivados: bloqueosActivos.length,
          timestamp: new Date().toISOString(),
        };

        await axios.post(this.taskerWebhookUrl, payload, {
          timeout: 5000,
        });

        this.logger.log(`Comando desbloquear_todo enviado a Tasker`);
      } catch (error) {
        this.logger.error(
          `Error al enviar desbloquear_todo a Tasker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return {
      bloqueosDesactivados: bloqueosActivos.length,
    };
  }
}
