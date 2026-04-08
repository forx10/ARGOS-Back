import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppBlockerService {
  private readonly logger = new Logger(AppBlockerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Activate UNBREAKABLE app blocking
   */
  async activateBlocking(userId: string, apps: string[], hours: number = 1) {
    try {
      this.logger.log(`Activating UNBREAKABLE app blocking for user: ${userId} for ${hours} hours`);
      this.logger.log(`Apps to block: ${apps.join(', ')}`);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

      // Check if there's already an active block for these apps
      const existingBlock = await this.prisma.bloqueo_activo.findFirst({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'apps',
          tiempo_fin: {
            gte: now,
          },
        },
      });

      if (existingBlock) {
        const remainingMinutes = Math.ceil((existingBlock.tiempo_fin.getTime() - now.getTime()) / (1000 * 60));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;

        let timeText = '';
        if (remainingHours > 0) {
          timeText = `${remainingHours} hora${remainingHours > 1 ? 's' : ''}`;
          if (remainingMins > 0) {
            timeText += ` y ${remainingMins} minuto${remainingMins > 1 ? 's' : ''}`;
          }
        } else {
          timeText = `${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`;
        }

        return {
          success: false,
          message: `Ya hay un bloqueo de apps activo. No puedes desbloquear aún, faltan ${timeText}`,
          blockedUntil: existingBlock.tiempo_fin,
          remainingMinutes,
          blockedApps: existingBlock.apps_bloqueadas,
        };
      }

      // Create new unbreakable block
      await this.prisma.bloqueo_activo.create({
        data: {
          usuario_id: userId,
          apps_bloqueadas: apps,
          tiempo_inicio: now,
          tiempo_fin: expiresAt,
          estado: 'activo',
          razon: 'apps',
        },
      });

      const blockDurationText = hours === 1 ? '1 hora' : `${hours} horas`;
      const appsText = apps.length === 1 ? `la app ${apps[0]}` : `${apps.length} apps`;

      return {
        success: true,
        message: `Listo, ${appsText} bloqueada${apps.length > 1 ? 's' : ''} por ${blockDurationText}`,
        blockedApps: apps,
        blockedUntil: expiresAt,
        hours,
        unbreakable: true,
        warning: 'Este bloqueo NO se puede desactivar hasta que expire el tiempo',
      };
    } catch (error) {
      this.logger.error(`Failed to activate app blocking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Attempt to deactivate app blocking (only if time has expired)
   */
  async deactivateBlocking(userId: string) {
    try {
      this.logger.log(`Attempting to deactivate app blocking for user: ${userId}`);

      const now = new Date();

      // Check for active unbreakable block
      const activeBlock = await this.prisma.bloqueo_activo.findFirst({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'apps',
          tiempo_fin: {
            gte: now,
          },
        },
      });

      if (activeBlock) {
        // Block is still active - CANNOT unlock
        const remainingTime = activeBlock.tiempo_fin.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;

        let timeText = '';
        if (remainingHours > 0) {
          timeText = `${remainingHours} hora${remainingHours > 1 ? 's' : ''}`;
          if (remainingMins > 0) {
            timeText += ` y ${remainingMins} minuto${remainingMins > 1 ? 's' : ''}`;
          }
        } else {
          timeText = `${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`;
        }

        this.logger.warn(`Unlock attempt denied - ${remainingMinutes} minutes remaining`);

        return {
          success: false,
          blocked: true,
          message: `No puedes desbloquear las apps aún, faltan ${timeText}`,
          blockedUntil: activeBlock.tiempo_fin,
          remainingMinutes,
          blockedApps: activeBlock.apps_bloqueadas,
          canUnlockAt: activeBlock.tiempo_fin.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        };
      }

      // Time has expired - can unlock now
      // Mark the block as completed
      const completedBlocks = await this.prisma.bloqueo_activo.updateMany({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'apps',
        },
        data: {
          estado: 'completado',
        },
      });

      this.logger.log(`Deactivated ${completedBlocks.count} app blocks`);

      return {
        success: true,
        message: 'Bloqueo de apps desactivado',
        unblockedCount: completedBlocks.count,
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate app blocking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get blocking status
   */
  async getBlockingStatus(userId: string) {
    try {
      const now = new Date();

      const activeBlock = await this.prisma.bloqueo_activo.findFirst({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'apps',
          tiempo_fin: {
            gte: now,
          },
        },
      });

      if (!activeBlock) {
        return {
          isActive: false,
          message: 'No hay bloqueos de apps activos',
        };
      }

      const remainingMinutes = Math.ceil((activeBlock.tiempo_fin.getTime() - now.getTime()) / (1000 * 60));

      return {
        isActive: true,
        blockedApps: activeBlock.apps_bloqueadas,
        blockedUntil: activeBlock.tiempo_fin,
        remainingMinutes,
        canUnlockAt: activeBlock.tiempo_fin.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      };
    } catch (error) {
      this.logger.error(`Failed to get blocking status: ${error.message}`);
      throw error;
    }
  }
}
