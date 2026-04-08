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
   * Activate adult content blocking
   */
  async activateBlocking(userId: string = 'usuario_1') {
    try {
      this.logger.log(`Activating adult content blocking for user: ${userId}`);

      // Block all adult domains
      const blockedDomains = [];
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

      return {
        success: true,
        message: 'Bloqueo de contenido adulto activado',
        blockedDomains: blockedDomains.length,
        totalDomains: this.adultDomains.length,
        domains: blockedDomains,
      };
    } catch (error) {
      this.logger.error(`Failed to activate blocking: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deactivate adult content blocking
   */
  async deactivateBlocking(userId: string = 'usuario_1') {
    try {
      this.logger.log(`Deactivating adult content blocking for user: ${userId}`);

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
