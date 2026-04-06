import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TaskerEvent {
  usuario_id: string;
  bloqueo_id?: number;
  estado?: string;
  evento: string; // "bloqueo_confirmado", "desbloqueo_confirmado", etc
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Procesar evento de Tasker
   */
  async procesarEventoTasker(evento: TaskerEvent): Promise<{
    exito: boolean;
    mensaje: string;
  }> {
    this.logger.log(`Procesando evento de Tasker: ${evento.evento}`);

    switch (evento.evento) {
      case 'bloqueo_confirmado':
        return await this.procesarBloqueoConfirmado(evento);
      case 'desbloqueo_confirmado':
        return await this.procesarDesbloqueoConfirmado(evento);
      case 'error_bloqueo':
        return await this.procesarErrorBloqueo(evento);
      default:
        this.logger.warn(`Evento desconocido: ${evento.evento}`);
        return { exito: false, mensaje: 'Evento desconocido' };
    }
  }

  /**
   * Procesar confirmación de bloqueo desde Tasker
   */
  private async procesarBloqueoConfirmado(evento: TaskerEvent): Promise<{
    exito: boolean;
    mensaje: string;
  }> {
    this.logger.log(
      `Bloqueo confirmado por Tasker para usuario ${evento.usuario_id} (bloqueo_id: ${evento.bloqueo_id})`,
    );

    if (!evento.bloqueo_id) {
      return { exito: false, mensaje: 'bloqueo_id requerido' };
    }

    try {
      await this.prisma.bloqueo_activo.update({
        where: { id: evento.bloqueo_id },
        data: {
          estado: 'activo', // Confirmar que está activo
        },
      });

      return {
        exito: true,
        mensaje: 'Bloqueo confirmado en BD',
      };
    } catch (error) {
      this.logger.error(`Error al confirmar bloqueo: ${error}`);
      return {
        exito: false,
        mensaje: 'Error al actualizar BD',
      };
    }
  }

  /**
   * Procesar confirmación de desbloqueo desde Tasker
   */
  private async procesarDesbloqueoConfirmado(evento: TaskerEvent): Promise<{
    exito: boolean;
    mensaje: string;
  }> {
    this.logger.log(
      `Desbloqueo confirmado por Tasker para usuario ${evento.usuario_id} (bloqueo_id: ${evento.bloqueo_id})`,
    );

    if (!evento.bloqueo_id) {
      return { exito: false, mensaje: 'bloqueo_id requerido' };
    }

    try {
      await this.prisma.bloqueo_activo.update({
        where: { id: evento.bloqueo_id },
        data: {
          estado: 'completado',
        },
      });

      return {
        exito: true,
        mensaje: 'Desbloqueo confirmado en BD',
      };
    } catch (error) {
      this.logger.error(`Error al confirmar desbloqueo: ${error}`);
      return {
        exito: false,
        mensaje: 'Error al actualizar BD',
      };
    }
  }

  /**
   * Procesar error de bloqueo desde Tasker
   */
  private async procesarErrorBloqueo(evento: TaskerEvent): Promise<{
    exito: boolean;
    mensaje: string;
  }> {
    this.logger.warn(
      `Error en bloqueo reportado por Tasker para usuario ${evento.usuario_id} (bloqueo_id: ${evento.bloqueo_id})`,
    );

    if (!evento.bloqueo_id) {
      return { exito: false, mensaje: 'bloqueo_id requerido' };
    }

    try {
      await this.prisma.bloqueo_activo.update({
        where: { id: evento.bloqueo_id },
        data: {
          estado: 'pausado', // Marcar como pausado, no activo
        },
      });

      return {
        exito: true,
        mensaje: 'Error registrado en BD',
      };
    } catch (error) {
      this.logger.error(`Error al registrar error de bloqueo: ${error}`);
      return {
        exito: false,
        mensaje: 'Error al actualizar BD',
      };
    }
  }

  /**
   * Obtener estado de bloqueo
   */
  async obtenerEstadoBloqueo(bloqueoId: number): Promise<any> {
    return this.prisma.bloqueo_activo.findUnique({
      where: { id: bloqueoId },
    });
  }
}
