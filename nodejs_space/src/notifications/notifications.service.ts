import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface NotificationData {
  app: string;
  title: string;
  text: string;
  sender?: string;
  timestamp?: Date;
  userId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Apps que generan notificaciones de voz
  private readonly voiceEnabledApps = [
    'WhatsApp',
    'Telegram',
    'WhatsApp Business',
    'Signal',
    'Messenger',
    'Instagram',
    'Twitter',
    'X',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Receive notification from Tasker
   */
  async receiveNotification(data: NotificationData) {
    try {
      const userId = data.userId || 'usuario_1';
      const timestamp = data.timestamp || new Date();

      this.logger.log(
        `Received notification from ${data.app}: ${data.title} - ${data.text}`,
      );

      // Check if voice notifications are enabled for this app
      const shouldAnnounce = this.voiceEnabledApps.includes(data.app);

      // Store notification in database
      const notification = await this.prisma.notificacion.create({
        data: {
          usuario_id: userId,
          app: data.app,
          titulo: data.title,
          texto: data.text,
          remitente: data.sender || 'Desconocido',
          timestamp: timestamp,
          anunciada: false,
          voz_habilitada: shouldAnnounce,
        },
      });

      // Generate voice message if enabled
      let voiceMessage: string | null = null;
      if (shouldAnnounce) {
        voiceMessage = this.generateVoiceMessage(data);
      }

      return {
        success: true,
        message: 'Notificación recibida',
        notification: {
          id: notification.id,
          app: notification.app,
          sender: notification.remitente,
          title: notification.titulo,
          text: notification.texto,
        },
        voiceAnnouncement: shouldAnnounce,
        voiceMessage,
      };
    } catch (error) {
      this.logger.error(`Failed to receive notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate voice message from notification
   */
  private generateVoiceMessage(data: NotificationData): string {
    const sender = data.sender || 'un contacto';
    const app = data.app;

    // Different voice messages for different apps
    if (app === 'WhatsApp' || app === 'WhatsApp Business') {
      if (data.title && data.title.toLowerCase().includes('llamada')) {
        return `Llamada perdida de ${sender} en WhatsApp`;
      }
      return `Tienes un mensaje de ${sender} en WhatsApp`;
    }

    if (app === 'Telegram') {
      return `Mensaje de ${sender} en Telegram`;
    }

    if (app === 'Signal') {
      return `Mensaje de ${sender} en Signal`;
    }

    if (app === 'Messenger' || app === 'Instagram') {
      return `Mensaje de ${sender} en ${app}`;
    }

    // Generic message
    return `Tienes una notificación de ${sender} en ${app}`;
  }

  /**
   * Get unannounced notifications
   */
  async getUnannounced(userId: string = 'usuario_1') {
    try {
      const notifications = await this.prisma.notificacion.findMany({
        where: {
          usuario_id: userId,
          anunciada: false,
          voz_habilitada: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
      });

      const voiceMessages = notifications.map((n) =>
        this.generateVoiceMessage({
          app: n.app,
          title: n.titulo,
          text: n.texto,
          sender: n.remitente,
        }),
      );

      return {
        count: notifications.length,
        notifications: notifications.map((n, index) => ({
          id: n.id,
          app: n.app,
          sender: n.remitente,
          title: n.titulo,
          text: n.texto,
          timestamp: n.timestamp,
          voiceMessage: voiceMessages[index],
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get unannounced notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark notification as announced
   */
  async markAsAnnounced(notificationId: number) {
    try {
      await this.prisma.notificacion.update({
        where: { id: notificationId },
        data: { anunciada: true },
      });

      return {
        success: true,
        message: 'Notificación marcada como anunciada',
      };
    } catch (error) {
      this.logger.error(`Failed to mark as announced: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configure voice-enabled apps
   */
  async configureVoiceApps(userId: string, apps: string[]) {
    try {
      // Store configuration in database
      await this.prisma.configuracion.upsert({
        where: {
          usuario_id_clave: {
            usuario_id: userId,
            clave: 'voice_enabled_apps',
          },
        },
        update: {
          valor: JSON.stringify(apps),
        },
        create: {
          usuario_id: userId,
          clave: 'voice_enabled_apps',
          valor: JSON.stringify(apps),
        },
      });

      return {
        success: true,
        message: 'Apps con voz configuradas',
        apps,
      };
    } catch (error) {
      this.logger.error(`Failed to configure voice apps: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get notification history
   */
  async getHistory(userId: string = 'usuario_1', limit: number = 50) {
    try {
      const notifications = await this.prisma.notificacion.findMany({
        where: {
          usuario_id: userId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });

      return {
        count: notifications.length,
        notifications: notifications.map((n) => ({
          id: n.id,
          app: n.app,
          sender: n.remitente,
          title: n.titulo,
          text: n.texto,
          timestamp: n.timestamp,
          announced: n.anunciada,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get history: ${error.message}`);
      throw error;
    }
  }
}
