import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadoService {
  private readonly logger = new Logger(EstadoService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener estado completo del usuario (bloqueos activos, turnos próximos, alarmas)
   */
  async obtenerEstadoCompleto(usuarioId: string): Promise<{
    usuario_id: string;
    bloqueos_activos: any[];
    turno_actual: any | null;
    proximo_turno: any | null;
    proximaAlarma: string | null;
    resumen: string;
  }> {
    this.logger.log(`Obteniendo estado completo para usuario ${usuarioId}`);

    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    // 1. Bloqueos activos
    const bloqueos = await this.prisma.bloqueo_activo.findMany({
      where: {
        usuario_id: usuarioId,
        estado: 'activo',
        tiempo_fin: {
          gt: ahora,
        },
      },
      orderBy: {
        tiempo_fin: 'asc',
      },
    });

    // 2. Turno actual
    const turnoActual = await this.prisma.turno.findFirst({
      where: {
        usuario_id: usuarioId,
        fecha: hoy,
        activo: true,
      },
    });

    let turnoActualData = null;
    if (turnoActual && horaActual >= turnoActual.hora_inicio && horaActual < turnoActual.hora_fin) {
      turnoActualData = turnoActual;
    }

    // 3. Próximo turno
    const proximoTurno = await this.prisma.turno.findFirst({
      where: {
        usuario_id: usuarioId,
        fecha: {
          gte: hoy,
        },
        activo: true,
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    // 4. Calcular próxima alarma (1.5h antes del turno)
    let proximaAlarma: string | null = null;
    if (proximoTurno && !turnoActualData) {
      const [horas, minutos] = proximoTurno.hora_inicio.split(':').map(Number);
      let totalMinutos = horas * 60 + minutos - 90; // 1.5h = 90 minutos
      if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
      }
      const horasCalculadas = Math.floor(totalMinutos / 60);
      const minutosCalculados = totalMinutos % 60;
      proximaAlarma = `${String(horasCalculadas).padStart(2, '0')}:${String(minutosCalculados).padStart(2, '0')}`;
    }

    // 5. Generar resumen
    let resumen = '';
    if (turnoActualData) {
      resumen = `En turno ahora: ${turnoActualData.tipo_turno}. Fin: ${turnoActualData.hora_fin}`;
    } else if (proximoTurno) {
      const fechaFormato = proximoTurno.fecha.toISOString().split('T')[0];
      resumen = `Próximo turno: ${proximoTurno.tipo_turno} el ${fechaFormato} a las ${proximoTurno.hora_inicio}. Alarma: ${proximaAlarma}`;
    } else {
      resumen = 'No hay turnos registrados';
    }

    if (bloqueos.length > 0) {
      const bloqueosInfo = bloqueos
        .map((b) => `${b.apps_bloqueadas.join(', ')} hasta ${b.tiempo_fin.toLocaleTimeString()}`)
        .join('; ');
      resumen += ` | Bloqueos activos: ${bloqueosInfo}`;
    }

    return {
      usuario_id: usuarioId,
      bloqueos_activos: bloqueos,
      turno_actual: turnoActualData,
      proximo_turno: proximoTurno,
      proximaAlarma,
      resumen,
    };
  }

  /**
   * Obtener solo bloqueos activos
   */
  async obtenerBloqueoActivos(usuarioId: string): Promise<any[]> {
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
        tiempo_fin: 'asc',
      },
    });
  }

  /**
   * Obtener solo próximos turnos
   */
  async obtenerProximosTurnos(usuarioId: string, dias: number = 7): Promise<any[]> {
    const hoy = new Date();
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + dias);

    return this.prisma.turno.findMany({
      where: {
        usuario_id: usuarioId,
        fecha: {
          gte: hoy,
          lte: futuro,
        },
        activo: true,
      },
      orderBy: {
        fecha: 'asc',
      },
    });
  }

  /**
   * Obtener sitios bloqueados registrados
   */
  async obtenerSitiosBloqueados(): Promise<any[]> {
    return this.prisma.sitio_bloqueado.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        categoria: 'asc',
      },
    });
  }
}
