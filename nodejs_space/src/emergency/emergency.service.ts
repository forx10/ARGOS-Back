import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Agregar un contacto de emergencia
   */
  async agregarContactoEmergencia(
    usuarioId: string,
    nombre: string,
    telefono: string,
    tipo: string = 'familia',
  ) {
    try {
      this.logger.log(`Agregando contacto de emergencia: ${nombre} (${telefono})`);
      
      const contacto = await this.prisma.contacto_emergencia.create({
        data: {
          usuario_id: usuarioId,
          nombre,
          telefono,
          tipo,
          activo: true,
        },
      });

      return {
        success: true,
        message: `✅ ${nombre} agregado como contacto de emergencia`,
        contacto,
      };
    } catch (error) {
      this.logger.error(`Error agregando contacto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todos los contactos de emergencia
   */
  async obtenerContactosEmergencia(usuarioId: string) {
    try {
      const contactos = await this.prisma.contacto_emergencia.findMany({
        where: {
          usuario_id: usuarioId,
          activo: true,
        },
        orderBy: { creado_en: 'desc' },
      });

      return {
        success: true,
        total: contactos.length,
        contactos,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo contactos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar un contacto de emergencia
   */
  async eliminarContactoEmergencia(usuarioId: string, contactoId: number) {
    try {
      const contacto = await this.prisma.contacto_emergencia.findUnique({
        where: { id: contactoId },
      });

      if (!contacto || contacto.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Contacto no encontrado',
        };
      }

      await this.prisma.contacto_emergencia.update({
        where: { id: contactoId },
        data: { activo: false },
      });

      return {
        success: true,
        message: `${contacto.nombre} eliminado de contactos de emergencia`,
      };
    } catch (error) {
      this.logger.error(`Error eliminando contacto: ${error.message}`);
      throw error;
    }
  }

  /**
   * Activar modo SOS
   * - Llama a contactos de emergencia
   * - Si no contestan, envía WhatsApp
   * - Registra el incidente
   */
  async activarSOS(
    usuarioId: string,
    latitud: number,
    longitud: number,
    tipoEmergencia: string = 'emergencia general',
  ) {
    try {
      this.logger.log(
        `🚨 SOS ACTIVADO para ${usuarioId} en ${latitud}, ${longitud}`,
      );

      // Crear incidente SOS
      const incidente = await this.prisma.incidente_sos.create({
        data: {
          usuario_id: usuarioId,
          latitud,
          longitud,
          tipo_emergencia: tipoEmergencia,
          estado: 'activo',
        },
      });

      // Obtener contactos de emergencia
      const contactos = await this.prisma.contacto_emergencia.findMany({
        where: {
          usuario_id: usuarioId,
          activo: true,
        },
        orderBy: { creado_en: 'asc' },
      });

      const respuesta = {
        success: true,
        message: '🚨 SOS ACTIVADO',
        incidente: {
          id: incidente.id,
          ubicacion: { latitud, longitud },
          mapa: `https://maps.google.com/?q=${latitud},${longitud}`,
        },
        acciones: [
          '📞 Llamando a contactos de emergencia...',
          '💬 Si no contestan, enviaré WhatsApp automáticamente',
          '📍 Ubicación compartida: ' +
            `https://maps.google.com/?q=${latitud},${longitud}`,
          '🎙️ Grabando audio para seguridad',
        ],
        contactos_a_contactar: contactos.map((c) => ({
          nombre: c.nombre,
          telefono: c.telefono,
        })),
      };

      // En producción, aquí se integraría con:
      // - API de telefonía (Twilio, etc) para llamadas
      // - API de WhatsApp (Twilio, Meta, etc) para mensajes
      // - Grabadora de audio

      return respuesta;
    } catch (error) {
      this.logger.error(`Error activando SOS: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancelar SOS (si usuario lo desactiva manualmente)
   */
  async cancelarSOS(usuarioId: string, incidenteId: number) {
    try {
      const incidente = await this.prisma.incidente_sos.findUnique({
        where: { id: incidenteId },
      });

      if (!incidente || incidente.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Incidente no encontrado',
        };
      }

      await this.prisma.incidente_sos.update({
        where: { id: incidenteId },
        data: {
          estado: 'cancelado',
          resuelto_en: new Date(),
        },
      });

      return {
        success: true,
        message: '✅ SOS cancelado. Gracias por usar ARGOS 🙏',
      };
    } catch (error) {
      this.logger.error(`Error cancelando SOS: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener historial de SOSs
   */
  async obtenerHistorialSOS(usuarioId: string) {
    try {
      const incidentes = await this.prisma.incidente_sos.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { creado_en: 'desc' },
        take: 20,
      });

      return {
        success: true,
        total: incidentes.length,
        incidentes: incidentes.map((i) => ({
          id: i.id,
          tipo: i.tipo_emergencia,
          ubicacion: `${i.latitud}, ${i.longitud}`,
          mapa: `https://maps.google.com/?q=${i.latitud},${i.longitud}`,
          estado: i.estado,
          contactos_contactados: i.contactos_contactados.length,
          fecha: i.creado_en,
          resuelto: i.estado === 'resuelto' ? i.resuelto_en : null,
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo historial: ${error.message}`);
      throw error;
    }
  }
}