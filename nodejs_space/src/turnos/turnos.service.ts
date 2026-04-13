import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import type { turno, bloqueo_activo } from '@prisma/client';

@Injectable()
export class TurnosService {
  private readonly logger = new Logger(TurnosService.name);
  private readonly ALARMA_MINUTOS_ANTES = 90; // 1.5 horas

  constructor(private prisma: PrismaService) {}

  /**
   * Crear/registrar un nuevo turno
   */
  async crearTurno(createTurnoDto: CreateTurnoDto): Promise<turno> {
    this.logger.log(
      `Creando turno para usuario ${createTurnoDto.usuario_id}: ${createTurnoDto.tipo_turno} en ${createTurnoDto.fecha}`,
    );

    const fecha = new Date(createTurnoDto.fecha);

    return this.prisma.turno.create({
      data: {
        usuario_id: createTurnoDto.usuario_id,
        hora_inicio: createTurnoDto.hora_inicio,
        hora_fin: createTurnoDto.hora_fin,
        tipo_turno: createTurnoDto.tipo_turno,
        fecha,
      },
    });
  }

  /**
   * Obtener próximo turno del usuario
   */
  async obtenerProximoTurno(usuarioId: string): Promise<turno | null> {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

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

    return proximoTurno;
  }

  /**
   * Obtener turno actual (si el usuario está en turno ahora)
   */
  async obtenerTurnoActual(usuarioId: string): Promise<turno | null> {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    const turnoActual = await this.prisma.turno.findFirst({
      where: {
        usuario_id: usuarioId,
        fecha: hoy,
        activo: true,
      },
    });

    if (!turnoActual) return null;

    // Verificar si hora actual está dentro del rango
    if (horaActual >= turnoActual.hora_inicio && horaActual < turnoActual.hora_fin) {
      return turnoActual;
    }

    return null;
  }

  /**
   * Calcular hora de alarma (1.5h antes del turno)
   */
  calcularHoraAlarma(horaInicio: string): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    let totalMinutos = horas * 60 + minutos - this.ALARMA_MINUTOS_ANTES;

    if (totalMinutos < 0) {
      totalMinutos += 24 * 60; // Día anterior
    }

    const horasCalculadas = Math.floor(totalMinutos / 60);
    const minutosCalculados = totalMinutos % 60;

    return `${String(horasCalculadas).padStart(2, '0')}:${String(minutosCalculados).padStart(2, '0')}`;
  }

  /**
   * Analizar calendario de turnos y generar órdenes de bloqueo automático
   */
  async analizarYGenerarOrdenes(
    usuarioId: string,
    appsABloquear: string[],
    sitiosABloquear: string[],
  ): Promise<{
    turnoActual: turno | null;
    proximoTurno: turno | null;
    horaAlarma: string | null;
    bloqueoActivo: bloqueo_activo | null;
    mensaje: string;
  }> {
    const turnoActual = await this.obtenerTurnoActual(usuarioId);
    const proximoTurno = await this.obtenerProximoTurno(usuarioId);

    let respuesta = {
      turnoActual,
      proximoTurno,
      horaAlarma: null as string | null,
      bloqueoActivo: null as bloqueo_activo | null,
      mensaje: '',
    };

    // Si está en turno actual, crear bloqueo inmediatamente
    if (turnoActual) {
      this.logger.log(`Usuario ${usuarioId} está en turno actual: ${turnoActual.tipo_turno}`);

      const tiempoFin = this.construirFechaPorHora(turnoActual.fecha, turnoActual.hora_fin);

      const bloqueo = await this.prisma.bloqueo_activo.create({
        data: {
          usuario_id: usuarioId,
          apps_bloqueadas: appsABloquear,
          sitios_bloqueados: sitiosABloquear,
          tiempo_fin: tiempoFin,
          estado: 'activo',
          razon: 'turno',
        },
      });

      respuesta.bloqueoActivo = bloqueo;
      respuesta.mensaje = `Bloqueo activado para turno ${turnoActual.tipo_turno}`;
    } else if (proximoTurno) {
      // Si hay próximo turno, calcular alarma
      const horaAlarma = this.calcularHoraAlarma(proximoTurno.hora_inicio);
      respuesta.horaAlarma = horaAlarma;
      respuesta.mensaje = `Próximo turno: ${proximoTurno.tipo_turno} el ${proximoTurno.fecha.toISOString().split('T')[0]} a las ${proximoTurno.hora_inicio}. Alarma a las ${horaAlarma}`;
    } else {
      respuesta.mensaje = 'No hay turnos próximos registrados';
    }

    return respuesta;
  }

  /**
   * Helper: construir fecha completa a partir de fecha y hora
   */
  private construirFechaPorHora(fecha: Date, hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const resultado = new Date(fecha);
    resultado.setHours(horas, minutos, 0, 0);
    return resultado;
  }

  /**
   * Obtener todos los turnos de un usuario
   */
  async obtenerTurnosUsuario(usuarioId: string, diasAnticipados: number = 30): Promise<turno[]> {
    const hoy = new Date();
    const futuro = new Date(hoy);
    futuro.setDate(futuro.getDate() + diasAnticipados);

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
   * Activar turno manualmente (por comando de voz)
   */
  async activarTurno(usuarioId: string, turnoId: number): Promise<{
    turno: turno;
    bloqueo: bloqueo_activo;
    mensaje: string;
  }> {
    const turno = await this.prisma.turno.findFirst({
      where: {
        id: turnoId,
        usuario_id: usuarioId,
      },
    });

    if (!turno) {
      throw new Error(`Turno ${turnoId} no encontrado para usuario ${usuarioId}`);
    }

    this.logger.log(`Activando turno ${turnoId} manualmente para usuario ${usuarioId}`);

    // Calcular tiempo de fin basado en la hora_fin del turno
    const ahora = new Date();
    const [horasFin, minutosFin] = turno.hora_fin.split(':').map(Number);
    const tiempoFin = new Date(ahora);
    tiempoFin.setHours(horasFin, minutosFin, 0, 0);

    // Si la hora de fin ya pasó hoy, usar mañana
    if (tiempoFin < ahora) {
      tiempoFin.setDate(tiempoFin.getDate() + 1);
    }

    // Crear bloqueo basado en el turno
    // Nota: Por ahora usamos apps/sitios vacíos, se pueden configurar en el turno
    const bloqueo = await this.prisma.bloqueo_activo.create({
      data: {
        usuario_id: usuarioId,
        apps_bloqueadas: [],
        sitios_bloqueados: [],
        tiempo_fin: tiempoFin,
        estado: 'activo',
        razon: `turno_${turnoId}`,
      },
    });

    return {
      turno,
      bloqueo,
      mensaje: `Turno ${turno.tipo_turno} activado hasta las ${turno.hora_fin}`,
    };
  }
}
