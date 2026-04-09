import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FocusModeService {
  private readonly logger = new Logger(FocusModeService.name);

  // Lista de apps que SIEMPRE pueden hacer llamadas
  private readonly APPS_LLAMADAS_BLOQUEADAS = [
    'com.android.phone',
    'com.google.android.dialer',
    'com.whatsapp',
    'com.facebook.orca', // Messenger
    'org.telegram.messenger',
    'com.viber.voip',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Activar Focus Mode (bloquea apps pero NO llamadas)
   */
  async activarFocusMode(
    usuarioId: string,
    duracionMinutos: number,
    appsABloquear: string[] = [],
    sitiosABloquear: string[] = [],
    motivo: string = 'concentracion',
  ) {
    try {
      if (duracionMinutos <= 0) {
        throw new Error('La duración debe ser mayor a 0');
      }

      const ahora = new Date();
      const horaFin = new Date(ahora.getTime() + duracionMinutos * 60000);

      this.logger.log(
        `📄 Focus Mode activado para ${usuarioId} - ${duracionMinutos}min`,
      );

      const sesion = await this.prisma.sesion_focus.create({
        data: {
          usuario_id: usuarioId,
          hora_inicio: ahora,
          hora_fin: horaFin,
          apps_bloqueadas: appsABloquear,
          sitios_bloqueados: sitiosABloquear,
          motivo,
          completado: false,
        },
      });

      return {
        success: true,
        message: `📄 Modo de concentración activado por ${duracionMinutos} minutos`,
        sesion: {
          id: sesion.id,
          duracion: duracionMinutos,
          horaFin: horaFin.toISOString(),
          appsDesbloqueadas: this.APPS_LLAMADAS_BLOQUEADAS, // Estas SIEMPRE se pueden usar
          appsBloqueadas: sesion.apps_bloqueadas,
          avisos: [
            '📄 Apps y sitios bloqueados',
            '📞 🌤️ Las llamadas SIEMPRE entran y salen (no están bloqueadas)',
            '🚨 Las emergencias (SOS) desbloquean todo instantáneamente',
            `⏰ Fin: ${horaFin.toLocaleTimeString()}`,
          ],
        },
      };
    } catch (error) {
      this.logger.error(`Error activando Focus Mode: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener sesion actual de Focus Mode
   */
  async obtenerSesionActual(usuarioId: string) {
    try {
      const sesion = await this.prisma.sesion_focus.findFirst({
        where: {
          usuario_id: usuarioId,
          completado: false,
          hora_fin: {
            gt: new Date(), // Mayor que ahora
          },
        },
        orderBy: { hora_inicio: 'desc' },
      });

      if (!sesion) {
        return {
          success: true,
          activo: false,
          message: 'No hay Focus Mode activo',
        };
      }

      const ahora = new Date();
      const tiempoRestante = Math.max(
        0,
        Math.round((sesion.hora_fin.getTime() - ahora.getTime()) / 60000),
      );

      return {
        success: true,
        activo: true,
        sesion: {
          id: sesion.id,
          motivo: sesion.motivo,
          appsBloqueadas: sesion.apps_bloqueadas,
          sitiosBloqueados: sesion.sitios_bloqueados,
          tiempoRestante: `${tiempoRestante} minutos`,
          horaFin: sesion.hora_fin.toLocaleTimeString(),
          appsDesbloqueadas: this.APPS_LLAMADAS_BLOQUEADAS,
          avisos: [
            '📞 Las llamadas SIEMPRE funcionan incluso en Focus Mode',
            '🚨 SOS desbloquea todo instantáneamente',
          ],
        },
      };
    } catch (error) {
      this.logger.error(`Error obteniendo sesión: ${error.message}`);
      throw error;
    }
  }

  /**
   * Completar Focus Mode (terminar manualmente)
   */
  async completarFocusMode(usuarioId: string, sesionId: number) {
    try {
      const sesion = await this.prisma.sesion_focus.findUnique({
        where: { id: sesionId },
      });

      if (!sesion || sesion.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Sesión no encontrada',
        };
      }

      // Calcular estadísticas
      const duracionTotal = Math.round(
        (sesion.hora_fin.getTime() - sesion.hora_inicio.getTime()) / 60000,
      );
      const duracionReal = Math.round(
        (new Date().getTime() - sesion.hora_inicio.getTime()) / 60000,
      );

      const actualizado = await this.prisma.sesion_focus.update({
        where: { id: sesionId },
        data: {
          completado: true,
          estadisticas: {
            tiempoPlaneado: `${duracionTotal}min`,
            tiempoReal: `${duracionReal}min`,
            appsBloqueadas: sesion.apps_bloqueadas.length,
            sitiosBloqueados: sesion.sitios_bloqueados.length,
          },
        },
      });

      return {
        success: true,
        message: '✅ Sesión de Focus completada. ¡Excelente trabajo!',
        estadisticas: {
          tiempoPlaneado: `${duracionTotal}min`,
          tiempoReal: `${duracionReal}min`,
          appsBloqueadas: sesion.apps_bloqueadas.length,
          sitiosBloqueados: sesion.sitios_bloqueados.length,
          motivacion: '- Has evitado distracciones 🙏',
        },
      };
    } catch (error) {
      this.logger.error(`Error completando Focus Mode: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de sesiones completadas
   */
  async obtenerEstadisticas(usuarioId: string) {
    try {
      const sesiones = await this.prisma.sesion_focus.findMany({
        where: {
          usuario_id: usuarioId,
          completado: true,
        },
        orderBy: { hora_inicio: 'desc' },
        take: 20,
      });

      const totalMinutos = sesiones.reduce((acc, s) => {
        return (
          acc +
          Math.round(
            (s.hora_fin.getTime() - s.hora_inicio.getTime()) / 60000,
          )
        );
      }, 0);

      const totalSesiones = sesiones.length;
      const appsEvitadas = new Set<string>();
      sesiones.forEach((s) => s.apps_bloqueadas.forEach((a) => appsEvitadas.add(a)));

      return {
        success: true,
        estadisticas: {
          totalSesiones,
          tiempoTotalFocus: `${totalMinutos}min`,
          tiempoPromedio: totalSesiones > 0 ? `${Math.round(totalMinutos / totalSesiones)}min` : '0min',
          appsEvitadas: Array.from(appsEvitadas).length,
          razonMasUsada:
            sesiones.length > 0
              ? this.obtenerModa(sesiones.map((s) => s.motivo || 'concentracion'))
              : 'ninguna',
        },
        ultimas_sesiones: sesiones.slice(0, 5).map((s) => ({
          fecha: s.hora_inicio.toLocaleDateString(),
          motivo: s.motivo,
          duracion: Math.round(
            (s.hora_fin.getTime() - s.hora_inicio.getTime()) / 60000,
          ),
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar si una app puede hacer llamadas (whitelist)
   */
  verificarAppLlamadas(appPackage: string): boolean {
    return this.APPS_LLAMADAS_BLOQUEADAS.includes(appPackage);
  }

  /**
   * Obtener lista de apps que SIEMPRE pueden hacer llamadas
   */
  obtenerAppsDesbloqueadas(): string[] {
    return this.APPS_LLAMADAS_BLOQUEADAS;
  }

  /**
   * Calcular la moda (valor más frecuente)
   */
  private obtenerModa(arr: string[]): string {
    if (arr.length === 0) return 'ninguna';
    const counts = new Map<string, number>();
    arr.forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
    let moda = arr[0];
    let maxCount = 0;
    counts.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        moda = key;
      }
    });
    return moda;
  }
}