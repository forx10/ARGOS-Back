import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmService } from '../alarmas/alarm.service';
import { BloqueoService } from '../bloqueo/bloqueo.service';
import { TurnosService } from '../turnos/turnos.service';
import { ComandoVozDto } from './dto/comando-voz.dto';

interface ComandoParsed {
  accion:
    | 'bloqueo_inmediato'
    | 'bloqueo_programado'
    | 'alarma'
    | 'activar_turno'
    | 'desactivar_turno'
    | 'crear_turno'
    | 'desbloquear_todo'
    | 'bloquear_categoria';
  timestamp?: Date;
  apps?: string[];
  sitios?: string[];
  duracion?: number;
  mensaje?: string;
  turno_id?: number;
  categoria?: 'pornografia' | 'redes_sociales';
  turno_config?: {
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
    apps: string[];
    sitios: string[];
  };
}

@Injectable()
export class ComandoVozService {
  private readonly logger = new Logger(ComandoVozService.name);

  constructor(
    private prisma: PrismaService,
    private alarmService: AlarmService,
    private bloqueoService: BloqueoService,
    private turnosService: TurnosService,
  ) {}

  async procesarComando(comandoDto: ComandoVozDto) {
    this.logger.log(`Procesando comando: ${comandoDto.texto}`);

    // Guardar comando en historial
    await this.prisma.comandos_voz.create({
      data: {
        usuario_id: comandoDto.usuarioId,
        texto: comandoDto.texto,
        audio_base64: comandoDto.audioBase64,
      },
    });

    // Parsear comando con LLM
    const parsed = await this.parsearConLLM(comandoDto.texto);

    // Ejecutar acción según tipo
    switch (parsed.accion) {
      case 'bloqueo_inmediato':
        return this.ejecutarBloqueoInmediato(comandoDto.usuarioId, parsed);

      case 'bloqueo_programado':
        return this.ejecutarBloqueoProgramado(comandoDto.usuarioId, parsed);

      case 'alarma':
        return this.ejecutarAlarma(comandoDto.usuarioId, parsed);

      case 'activar_turno':
        return this.ejecutarActivarTurno(comandoDto.usuarioId, parsed);

      case 'desactivar_turno':
        return this.ejecutarDesactivarTurno(comandoDto.usuarioId);

      case 'crear_turno':
        return this.ejecutarCrearTurno(comandoDto.usuarioId, parsed);

      case 'desbloquear_todo':
        return this.ejecutarDesbloquearTodo(comandoDto.usuarioId);

      case 'bloquear_categoria':
        return this.ejecutarBloquearCategoria(comandoDto.usuarioId, parsed);

      default:
        return {
          exito: false,
          mensaje: 'No entendí el comando',
        };
    }
  }

  private async parsearConLLM(texto: string): Promise<ComandoParsed> {
    const prompt = `Eres ARGOS, un asistente de voz. Analiza el siguiente comando y extrae la información estructurada.

Comando: "${texto}"

Categorías de apps:
- Instagram: com.instagram.android
- TikTok: com.zhiliaoapp.musically
- YouTube: com.google.android.youtube
- Facebook: com.facebook.katana
- Twitter: com.twitter.android

Categorías de sitios:
- pornografia: ["pornhub.com", "xvideos.com", "xnxx.com", "redtube.com", "youporn.com"]
- redes_sociales: ["facebook.com", "instagram.com", "twitter.com", "tiktok.com"]

Tipos de acciones:
- bloqueo_inmediato: Bloquear apps/sitios ahora mismo
- bloqueo_programado: Bloquear a una hora específica del futuro
- alarma: Crear recordatorio para el futuro
- activar_turno: Activar un turno existente
- desactivar_turno: Desactivar todos los turnos
- crear_turno: Crear nuevo turno
- desbloquear_todo: Quitar todos los bloqueos
- bloquear_categoria: Bloquear categoría (pornografia/redes_sociales)

Extrae:
- accion: tipo de acción
- timestamp: fecha/hora (ISO format) si es futuro, null si es inmediato
- apps: array de package names
- sitios: array de URLs
- duracion: segundos de bloqueo
- mensaje: mensaje de recordatorio
- turno_id: ID del turno
- categoria: pornografia o redes_sociales
- turno_config: config del turno si se está creando

Responde SOLO con JSON válido. No incluyas markdown ni explicaciones.`;

    try {
      const response = await fetch(
        'https://apps.abacus.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            stream: false,
          }),
        },
      );

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      this.logger.log(`Comando parseado: ${JSON.stringify(parsed)}`);
      return parsed;
    } catch (error) {
      this.logger.error(`Error parseando comando con LLM: ${error.message}`);
      throw new Error('No pude entender el comando');
    }
  }

  private async ejecutarBloqueoInmediato(
    usuarioId: string,
    parsed: ComandoParsed,
  ) {
    const duracion = parsed.duracion || 3600;

    const bloqueo = await this.bloqueoService.crearBloqueo({
      usuarioId,
      appsBloquear: parsed.apps || [],
      sitiosBloquear: parsed.sitios || [],
      duracion,
      trigger: 'COMANDO_VOZ' as any,
      comandoVoz: 'Comando directo',
    });

    return {
      exito: true,
      mensaje: `Bloqueo activado por ${duracion / 60} minutos`,
      accion: 'bloqueo_inmediato',
      detalles: bloqueo,
    };
  }

  private async ejecutarBloqueoProgramado(
    usuarioId: string,
    parsed: ComandoParsed,
  ) {
    if (!parsed.timestamp) {
      throw new Error('Timestamp requerido para bloqueo programado');
    }

    const alarma = await this.alarmService.crearAlarma({
      usuarioId,
      timestamp: parsed.timestamp,
      tipo: 'bloqueo',
      metadata: {
        apps: parsed.apps,
        sitios: parsed.sitios,
        duracion: parsed.duracion,
      },
    });

    return {
      exito: true,
      mensaje: `Bloqueo programado para ${parsed.timestamp.toLocaleString('es-ES')}`,
      accion: 'bloqueo_programado',
      detalles: alarma,
    };
  }

  private async ejecutarAlarma(usuarioId: string, parsed: ComandoParsed) {
    if (!parsed.timestamp) {
      throw new Error('Timestamp requerido para alarma');
    }

    const alarma = await this.alarmService.crearAlarma({
      usuarioId,
      timestamp: parsed.timestamp,
      tipo: 'recordatorio',
      mensaje: parsed.mensaje,
      metadata: {
        turno_id: parsed.turno_id,
      },
    });

    return {
      exito: true,
      mensaje: `Alarma creada para ${parsed.timestamp.toLocaleString('es-ES')}`,
      accion: 'alarma',
      detalles: alarma,
    };
  }

  private async ejecutarActivarTurno(
    usuarioId: string,
    parsed: ComandoParsed,
  ) {
    if (!parsed.turno_id) {
      throw new Error('ID de turno requerido');
    }

    const turno = await this.turnosService.activarTurno(
      usuarioId,
      parsed.turno_id,
    );

    return {
      exito: true,
      mensaje: `Turno ${parsed.turno_id} activado`,
      accion: 'activar_turno',
      detalles: turno,
    };
  }

  private async ejecutarDesactivarTurno(usuarioId: string) {
    await this.bloqueoService.desbloquearTodo(usuarioId);

    return {
      exito: true,
      mensaje: 'Todos los bloqueos desactivados',
      accion: 'desactivar_turno',
    };
  }

  private async ejecutarCrearTurno(
    usuarioId: string,
    parsed: ComandoParsed,
  ) {
    if (!parsed.turno_config) {
      throw new Error('Configuración de turno requerida');
    }

    const turno = await this.turnosService.crearTurno({
      usuario_id: usuarioId,
      hora_inicio: parsed.turno_config.hora_inicio,
      hora_fin: parsed.turno_config.hora_fin,
      tipo_turno: parsed.turno_config.nombre,
      fecha: new Date().toISOString(),
    });

    return {
      exito: true,
      mensaje: `Turno "${parsed.turno_config.nombre}" creado`,
      accion: 'crear_turno',
      detalles: turno,
    };
  }

  private async ejecutarDesbloquearTodo(usuarioId: string) {
    await this.bloqueoService.desbloquearTodo(usuarioId);

    return {
      exito: true,
      mensaje: 'Todos los bloqueos eliminados',
      accion: 'desbloquear_todo',
    };
  }

  private async ejecutarBloquearCategoria(
    usuarioId: string,
    parsed: ComandoParsed,
  ) {
    const categorias: Record<string, string[]> = {
      pornografia: [
        'pornhub.com',
        'xvideos.com',
        'xnxx.com',
        'redtube.com',
        'youporn.com',
        'spankbang.com',
        'xhamster.com',
      ],
      redes_sociales: [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'tiktok.com',
        'snapchat.com',
      ],
    };

    if (!parsed.categoria) {
      throw new Error('Categoría requerida');
    }

    const sitios = categorias[parsed.categoria] || [];

    const bloqueo = await this.bloqueoService.crearBloqueo({
      usuarioId,
      appsBloquear: [],
      sitiosBloquear: sitios,
      duracion: 86400, // 24 horas por defecto
      trigger: 'COMANDO_VOZ' as any,
      comandoVoz: `Bloquear ${parsed.categoria}`,
    });

    return {
      exito: true,
      mensaje: `Categoría ${parsed.categoria} bloqueada`,
      accion: 'bloquear_categoria',
      detalles: bloqueo,
    };
  }
}
