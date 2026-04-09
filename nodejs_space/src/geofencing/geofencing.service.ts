import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeofencingService {
  private readonly logger = new Logger(GeofencingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un geofence (ubicación con recordatorios)
   */
  async crearGeofence(
    usuarioId: string,
    nombre: string,
    latitud: number,
    longitud: number,
    recordatorios: string[] = [],
    radio: number = 500,
    tipoBloqueo?: string,
    duracionBloqueo?: number,
  ) {
    try {
      this.logger.log(`Creando geofence ${nombre} en ${latitud}, ${longitud}`);

      const geofence = await this.prisma.geofence.create({
        data: {
          usuario_id: usuarioId,
          nombre,
          latitud,
          longitud,
          radio,
          recordatorios,
          tipo_bloqueo: tipoBloqueo,
          duracion_bloqueo: duracionBloqueo,
          activo: true,
        },
      });

      return {
        success: true,
        message: `📍 Geofence "${nombre}" creado exitosamente`,
        geofence,
      };
    } catch (error) {
      this.logger.error(`Error creando geofence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todos los geofences del usuario
   */
  async obtenerGeofences(usuarioId: string) {
    try {
      const geofences = await this.prisma.geofence.findMany({
        where: {
          usuario_id: usuarioId,
          activo: true,
        },
        orderBy: { creado_en: 'desc' },
      });

      return {
        success: true,
        total: geofences.length,
        geofences: geofences.map((g) => ({
          id: g.id,
          nombre: g.nombre,
          ubicacion: `${g.latitud}, ${g.longitud}`,
          radio: `${g.radio}m`,
          recordatorios: g.recordatorios,
          tipoBloqueo: g.tipo_bloqueo || 'ninguno',
          duracionBloqueo: g.duracion_bloqueo ? `${g.duracion_bloqueo}min` : null,
          mapa: `https://maps.google.com/?q=${g.latitud},${g.longitud}`,
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo geofences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar un geofence
   */
  async eliminarGeofence(usuarioId: string, geofenceId: number) {
    try {
      const geofence = await this.prisma.geofence.findUnique({
        where: { id: geofenceId },
      });

      if (!geofence || geofence.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Geofence no encontrado',
        };
      }

      await this.prisma.geofence.update({
        where: { id: geofenceId },
        data: { activo: false },
      });

      return {
        success: true,
        message: `Geofence "${geofence.nombre}" eliminado`,
      };
    } catch (error) {
      this.logger.error(`Error eliminando geofence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detectar si el usuario está dentro de un geofence
   */
  async detectarGeofence(usuarioId: string, latitud: number, longitud: number) {
    try {
      this.logger.log(`Detectando geofence para ${usuarioId} en ${latitud}, ${longitud}`);

      const geofences = await this.prisma.geofence.findMany({
        where: {
          usuario_id: usuarioId,
          activo: true,
        },
      });

      const detecciones = geofences
        .map((g) => {
          const distancia = this.calcularDistancia(
            latitud,
            longitud,
            g.latitud,
            g.longitud,
          );

          return {
            geofence: g.nombre,
            dentro: distancia <= g.radio,
            distancia: Math.round(distancia),
            radio: g.radio,
            recordatorios: g.recordatorios,
            tipoBloqueo: g.tipo_bloqueo,
            duracionBloqueo: g.duracion_bloqueo,
          };
        })
        .filter((d) => d.dentro);

      if (detecciones.length > 0) {
        const geofenceDetectado = detecciones[0];
        return {
          success: true,
          detectado: true,
          mensaje: `📍 Hola, veo que llegaste a ${geofenceDetectado.geofence} 🏠`,
          recordatorios: geofenceDetectado.recordatorios,
          acciones: [
            `✅ Recuerda: ${geofenceDetectado.recordatorios.join(', ')}`,
            `💪 ¿Quieres que bloquee el celular ${geofenceDetectado.duracionBloqueo}min?`,
          ],
          ofrecerBloqueo: {
            tipo: geofenceDetectado.tipoBloqueo,
            duracion: geofenceDetectado.duracionBloqueo,
          },
        };
      }

      return {
        success: true,
        detectado: false,
        mensaje: 'No estás dentro de ningún geofence',
      };
    } catch (error) {
      this.logger.error(`Error detectando geofence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar recordatorios de un geofence
   */
  async actualizarRecordatorios(
    usuarioId: string,
    geofenceId: number,
    recordatorios: string[],
  ) {
    try {
      const geofence = await this.prisma.geofence.findUnique({
        where: { id: geofenceId },
      });

      if (!geofence || geofence.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Geofence no encontrado',
        };
      }

      const actualizado = await this.prisma.geofence.update({
        where: { id: geofenceId },
        data: { recordatorios },
      });

      return {
        success: true,
        message: `✅ Recordatorios actualizados para ${actualizado.nombre}`,
        recordatorios: actualizado.recordatorios,
      };
    } catch (error) {
      this.logger.error(`Error actualizando recordatorios: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calcular distancia entre dos coordenadas (fórmula Haversine)
   */
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}