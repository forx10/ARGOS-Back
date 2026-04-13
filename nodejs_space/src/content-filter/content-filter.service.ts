import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);

  // Lista de dominios pornográficos más comunes
  private readonly adultDomains = [
    'pornhub.com',
    'xvideos.com',
    'xnxx.com',
    'redtube.com',
    'youporn.com',
    'xhamster.com',
    'tube8.com',
    'spankbang.com',
    'txxx.com',
    'beeg.com',
    'drtuber.com',
    'porn.com',
    'porntrex.com',
    'eporner.com',
    'hdzog.com',
    'tnaflix.com',
    'empflix.com',
    'motherless.com',
    'heavy-r.com',
    'pornone.com',
    'porngo.com',
    'porn300.com',
    'pornerbros.com',
    'hclips.com',
    'upornia.com',
    'vporn.com',
    'hotmovs.com',
    'pornhd.com',
    'youjizz.com',
    'nuvid.com',
    'alphaporno.com',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Activate adult content blocking with time lock (cannot be disabled until time expires)
   */
  async activateBlocking(userId: string = 'usuario_1', hours: number = 1) {
    try {
      this.logger.log(`Activating UNBREAKABLE adult content blocking for user: ${userId} for ${hours} hours`);

      // Block all adult domains
      const blockedDomains: string[] = [];
      for (const domain of this.adultDomains) {
        try {
          const exists = await this.prisma.sitio_bloqueado.findFirst({
            where: {
              patron_url: domain,
              categoria: 'pornografia',
            },
          });

          if (!exists) {
            await this.prisma.sitio_bloqueado.create({
              data: {
                patron_url: domain,
                categoria: 'pornografia',
                descripcion: 'Contenido adulto bloqueado por ARGOS',
                activo: true,
              },
            });
            blockedDomains.push(domain);
          } else if (!exists.activo) {
            // Si existe pero está inactivo, activarlo
            await this.prisma.sitio_bloqueado.update({
              where: { id: exists.id },
              data: { activo: true },
            });
            blockedDomains.push(domain);
          }
        } catch (error) {
          this.logger.warn(`Failed to block ${domain}: ${error.message}`);
        }
      }

      this.logger.log(`Blocked ${blockedDomains.length} adult domains`);

      // Create an UNBREAKABLE block with expiration time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

      // Check if there's already an active block
      const existingBlock = await this.prisma.bloqueo_activo.findFirst({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'contenido_adulto',
          tiempo_fin: {
            gte: now,
          },
        },
      });

      if (existingBlock) {
        const remainingMinutes = Math.ceil((existingBlock.tiempo_fin.getTime() - now.getTime()) / (1000 * 60));
        return {
          success: false,
          message: `Ya hay un bloqueo activo. No puedes desbloquear aún, faltan ${remainingMinutes} minutos`,
          blockedUntil: existingBlock.tiempo_fin,
          remainingMinutes,
        };
      }

      // Create new unbreakable block
      await this.prisma.bloqueo_activo.create({
        data: {
          usuario_id: userId,
          sitios_bloqueados: this.adultDomains,
          tiempo_inicio: now,
          tiempo_fin: expiresAt,
          estado: 'activo',
          razon: 'contenido_adulto',
        },
      });

      const blockDurationText = hours === 1 ? '1 hora' : `${hours} horas`;

      return {
        success: true,
        message: `Listo, páginas bloqueadas por ${blockDurationText}`,
        blockedDomains: this.adultDomains.length,
        blockedUntil: expiresAt,
        hours,
        unbreakable: true,
        warning: 'Este bloqueo NO se puede desactivar hasta que expire el tiempo',
      };
    } catch (error) {
      this.logger.error(`Failed to activate blocking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Attempt to deactivate adult content blocking (only if time has expired)
   */
  async deactivateBlocking(userId: string = 'usuario_1') {
    try {
      this.logger.log(`Attempting to deactivate adult content blocking for user: ${userId}`);

      const now = new Date();

      // Check for active unbreakable block
      const activeBlock = await this.prisma.bloqueo_activo.findFirst({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'contenido_adulto',
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
          message: `No puedes desbloquear aún, faltan ${timeText}`,
          blockedUntil: activeBlock.tiempo_fin,
          remainingMinutes,
          canUnlockAt: activeBlock.tiempo_fin.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        };
      }

      // Time has expired - can unlock now
      // Mark the block as completed
      await this.prisma.bloqueo_activo.updateMany({
        where: {
          usuario_id: userId,
          estado: 'activo',
          razon: 'contenido_adulto',
        },
        data: {
          estado: 'completado',
        },
      });

      // Deactivate all adult domain blocks
      const result = await this.prisma.sitio_bloqueado.updateMany({
        where: {
          patron_url: {
            in: this.adultDomains,
          },
          categoria: 'pornografia',
          activo: true,
        },
        data: {
          activo: false,
        },
      });

      this.logger.log(`Deactivated ${result.count} adult domain blocks`);

      return {
        success: true,
        message: 'Bloqueo de contenido adulto desactivado',
        unblockedDomains: result.count,
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate blocking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get blocking status
   */
  async getBlockingStatus(userId: string = 'usuario_1') {
    try {
      const blockedCount = await this.prisma.sitio_bloqueado.count({
        where: {
          patron_url: {
            in: this.adultDomains,
          },
          categoria: 'pornografia',
          activo: true,
        },
      });

      const isActive = blockedCount > 0;

      return {
        isActive,
        blockedDomains: blockedCount,
        totalDomains: this.adultDomains.length,
        percentage: Math.round((blockedCount / this.adultDomains.length) * 100),
      };
    } catch (error) {
      this.logger.error(`Failed to get blocking status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get list of blocked adult domains
   */
  async getBlockedDomains(userId: string = 'usuario_1') {
    try {
      const blocked = await this.prisma.sitio_bloqueado.findMany({
        where: {
          patron_url: {
            in: this.adultDomains,
          },
          categoria: 'pornografia',
          activo: true,
        },
        select: {
          patron_url: true,
          creado_en: true,
        },
        orderBy: {
          creado_en: 'desc',
        },
      });

      return {
        domains: blocked.map((b: any) => b.patron_url),
        count: blocked.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get blocked domains: ${error.message}`);
      throw error;
    }
  }
}
