import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Agregar una tarea nueva
   */
  async agregarTarea(
    usuarioId: string,
    titulo: string,
    descripcion?: string,
    prioridad: string = 'media',
    ubicacion?: string,
    fechaVencimiento?: Date,
  ) {
    try {
      this.logger.log(`Agregando tarea: ${titulo}`);

      const tarea = await this.prisma.tarea.create({
        data: {
          usuario_id: usuarioId,
          titulo,
          descripcion,
          prioridad,
          ubicacion,
          fecha_vencimiento: fechaVencimiento,
          completada: false,
        },
      });

      return {
        success: true,
        message: `✅ Tarea "${titulo}" agregada`,
        tarea: {
          id: tarea.id,
          titulo: tarea.titulo,
          prioridad: tarea.prioridad,
          creada: tarea.creada_en,
        },
      };
    } catch (error) {
      this.logger.error(`Error agregando tarea: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todas las tareas
   */
  async obtenerTareas(usuarioId: string, soloActivas: boolean = true) {
    try {
      const tareas = await this.prisma.tarea.findMany({
        where: {
          usuario_id: usuarioId,
          completada: soloActivas ? false : undefined,
        },
        orderBy: [
          { prioridad: 'desc' }, // Alta primero
          { fecha_vencimiento: 'asc' }, // Fecha próxima
          { creada_en: 'desc' }, // Más reciente
        ],
      });

      const agrupadasPorPrioridad = {
        alta: tareas.filter((t) => t.prioridad === 'alta'),
        media: tareas.filter((t) => t.prioridad === 'media'),
        baja: tareas.filter((t) => t.prioridad === 'baja'),
      };

      return {
        success: true,
        total: tareas.length,
        resumen: {
          alta: agrupadasPorPrioridad.alta.length,
          media: agrupadasPorPrioridad.media.length,
          baja: agrupadasPorPrioridad.baja.length,
        },
        tareas: tareas.map((t) => ({
          id: t.id,
          titulo: t.titulo,
          descripcion: t.descripcion,
          prioridad: t.prioridad,
          ubicacion: t.ubicacion,
          vencimiento: t.fecha_vencimiento ? t.fecha_vencimiento.toLocaleDateString() : 'Sin fecha',
          completada: t.completada,
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo tareas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Marcar tarea como completada
   */
  async completarTarea(usuarioId: string, tareaId: number) {
    try {
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: tareaId },
      });

      if (!tarea || tarea.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const actualizada = await this.prisma.tarea.update({
        where: { id: tareaId },
        data: {
          completada: true,
          completada_en: new Date(),
        },
      });

      return {
        success: true,
        message: `✅ "${actualizada.titulo}" completada. ¡Excelente!`,
        tarea: {
          id: actualizada.id,
          titulo: actualizada.titulo,
          completadaEn: actualizada.completada_en,
        },
      };
    } catch (error) {
      this.logger.error(`Error completando tarea: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar una tarea
   */
  async eliminarTarea(usuarioId: string, tareaId: number) {
    try {
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: tareaId },
      });

      if (!tarea || tarea.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      await this.prisma.tarea.delete({
        where: { id: tareaId },
      });

      return {
        success: true,
        message: `Tarea "${tarea.titulo}" eliminada`,
      };
    } catch (error) {
      this.logger.error(`Error eliminando tarea: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener tareas por ubicación (geofence)
   */
  async obtenerTareasPorUbicacion(usuarioId: string, ubicacion: string) {
    try {
      const tareas = await this.prisma.tarea.findMany({
        where: {
          usuario_id: usuarioId,
          ubicacion,
          completada: false,
        },
      });

      return {
        success: true,
        ubicacion,
        tareas: tareas.length,
        listaTareas: tareas.map((t) => ({
          id: t.id,
          titulo: t.titulo,
          prioridad: t.prioridad,
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo tareas por ubicación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener recordatorio de voz para tareas pendientes
   */
  async obtenerRecordatorioVoz(usuarioId: string): Promise<string> {
    try {
      const tareas = await this.prisma.tarea.findMany({
        where: {
          usuario_id: usuarioId,
          completada: false,
        },
        orderBy: { prioridad: 'desc' },
        take: 5,
      });

      if (tareas.length === 0) {
        return 'No tienes tareas pendientes. ¡Perfecto!';
      }

      const tareasAlta = tareas.filter((t) => t.prioridad === 'alta');
      const recordatorio = [
        `Tienes ${tareas.length} tarea${tareas.length > 1 ? 's' : ''} pendiente${tareas.length > 1 ? 's' : ''}.`,
      ];

      if (tareasAlta.length > 0) {
        recordatorio.push(
          `${tareasAlta.length} de alta prioridad: ${tareasAlta.map((t) => t.titulo).join(', ')}.`,
        );
      }

      recordatorio.push('Dime qué tarea completaste o qué necesitas.');

      return recordatorio.join(' ');
    } catch (error) {
      this.logger.error(`Error obteniendo recordatorio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar prioridad de una tarea
   */
  async actualizarPrioridad(
    usuarioId: string,
    tareaId: number,
    nuevaPrioridad: string,
  ) {
    try {
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: tareaId },
      });

      if (!tarea || tarea.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const actualizada = await this.prisma.tarea.update({
        where: { id: tareaId },
        data: { prioridad: nuevaPrioridad },
      });

      return {
        success: true,
        message: `Prioridad actualizada a ${nuevaPrioridad}`,
        tarea: {
          id: actualizada.id,
          titulo: actualizada.titulo,
          prioridad: actualizada.prioridad,
        },
      };
    } catch (error) {
      this.logger.error(`Error actualizando prioridad: ${error.message}`);
      throw error;
    }
  }
}