import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComandoUnificadoDto } from './dto/comando-voz.dto';

interface AccionDetectada {
  tipo: string;
  parametros: Record<string, any>;
  respuestaVoz: string;
  endpoint: string;
}

@Injectable()
export class ComandoVozUnificadoService {
  private readonly logger = new Logger(ComandoVozUnificadoService.name);
  private readonly BACKEND_URL = process.env.APP_ORIGIN || 'https://argos-back-scn5.onrender.com';
  private readonly AUTOREMOTE_BASE = process.env.AUTOREMOTE_BASE_URL || 'https://autoremotejoaomgcd.appspot.com';
  private readonly AUTOREMOTE_KEY = process.env.AUTOREMOTE_USER_KEY || '';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ENDPOINT PRINCIPAL - Recibe CUALQUIER comando de voz y lo enruta al módulo correcto.
   * Este es el único endpoint que Tasker necesita llamar.
   */
  async procesarComandoUnificado(dto: ComandoUnificadoDto) {
    const { usuarioId, comando, pcId } = dto;
    this.logger.log(`Comando recibido de ${usuarioId}: "${comando}"`);

    // 1. Obtener perfil del usuario (nombre, wake word, voz)
    const perfil = await this.obtenerPerfil(usuarioId);

    // 2. Limpiar el wake word del comando
    const comandoLimpio = this.limpiarWakeWord(comando, perfil.wakeWord);
    this.logger.log(`Comando limpio: "${comandoLimpio}"`);

    // 3. Guardar en historial
    await this.prisma.comandos_voz.create({
      data: {
        usuario_id: usuarioId,
        texto: comando,
      },
    });

    // 4. Clasificar y ejecutar con LLM
    let resultado: any;
    try {
      resultado = await this.clasificarYEjecutar(usuarioId, comandoLimpio, pcId || null, perfil);
    } catch (error) {
      this.logger.error(`Error procesando comando: ${error.message}`);
      resultado = {
        exito: false,
        respuestaVoz: `Lo siento ${perfil.nombreUsuario}, no pude procesar ese comando. Inténtalo de nuevo.`,
        accion: 'error',
      };
    }

    // 5. Enviar respuesta por AutoRemote para que Tasker la diga en voz alta
    if (resultado.respuestaVoz) {
      await this.enviarRespuestaAutoRemote(resultado.respuestaVoz, perfil.generoVoz);
    }

    return {
      exito: resultado.exito,
      respuestaVoz: resultado.respuestaVoz,
      accion: resultado.accion,
      detalles: resultado.detalles || null,
      perfil: {
        nombreAsistente: perfil.nombreAsistente,
        generoVoz: perfil.generoVoz,
      },
    };
  }

  /**
   * Clasifica el comando con LLM y ejecuta la acción correspondiente
   */
  private async clasificarYEjecutar(
    usuarioId: string,
    comando: string,
    pcId: string | null,
    perfil: any,
  ) {
    const prompt = `Eres ${perfil.nombreAsistente}, un asistente personal inteligente. Tu usuario se llama ${perfil.nombreUsuario}.
Tu personalidad es ${perfil.personalidad}.

Analiza este comando de voz y clasifícalo:

Comando: "${comando}"

CATEGORÍAS DISPONIBLES:

1. "bloqueo" - Bloquear apps o sitios web
   Ejemplos: "bloquea Instagram", "bloquea redes sociales", "bloquea pornografía"
   Params: { apps: ["com.instagram.android"], sitios: ["facebook.com"], duracion: 3600, categoria: "pornografia|redes_sociales" }

2. "desbloqueo" - Quitar bloqueos
   Ejemplos: "desbloquea todo", "quita los bloqueos"

3. "turno" - Gestionar turnos rotativos
   Ejemplos: "activa turno de mañana", "crea turno de 6 a 2"
   Params: { accion: "crear|activar|desactivar", hora_inicio: "06:00", hora_fin: "14:00", tipo: "6AM-2PM" }

4. "alarma" - Crear recordatorios o alarmas
   Ejemplos: "recuerda que tengo cita a las 3", "alarma a las 7am"
   Params: { hora: "15:00", mensaje: "Cita médica" }

5. "tarea" - Gestionar tareas pendientes
   Ejemplos: "agrega tarea hacer ejercicio", "mis tareas pendientes"
   Params: { accion: "agregar|listar|completar", titulo: "...", prioridad: "alta|media|baja" }

6. "pc" - Comandos para la computadora
   Ejemplos: "vamos a la PC", "abre mis sitios de trabajo", "abre Chrome", "cierra todo en la PC"
   Params: { tipoComando: "abrir_sitios|abrir_sitios_categoria|abrir_app|cerrar_todo", categoria: "trabajo", app: "chrome" }

7. "emergencia" - Activar SOS
   Ejemplos: "emergencia", "SOS", "llama a la policía"

8. "estado" - Consultar estado actual
   Ejemplos: "cuál es mi estado", "qué tengo bloqueado"

9. "focus" - Modo enfoque
   Ejemplos: "modo enfoque 2 horas", "voy a estudiar"
   Params: { duracion: 7200, motivo: "estudio" }

10. "musica" - Control de música
    Ejemplos: "pon música", "siguiente canción", "pausa"
    Params: { accion: "play|pause|next|prev" }

11. "perfil" - Cambiar configuración del asistente
    Ejemplos: "cámbiate el nombre a Friday", "quiero voz de mujer"
    Params: { nombreAsistente: "Friday", generoVoz: "mujer" }

12. "conversacion" - Pregunta general o charla casual
    Ejemplos: "qué hora es", "cuéntame un chiste", "cómo está el clima"
    Params: { pregunta: "..." }

MAPEO DE APPS (nombre común → package name):
- Instagram: com.instagram.android
- TikTok: com.zhiliaoapp.musically  
- YouTube: com.google.android.youtube
- Facebook: com.facebook.katana
- Twitter/X: com.twitter.android
- WhatsApp: com.whatsapp
- Spotify: com.spotify.music
- Snapchat: com.snapchat.android
- Reddit: com.reddit.frontpage
- Telegram: org.telegram.messenger

Responde SOLO con JSON válido:
{
  "categoria": "...",
  "parametros": { ... },
  "respuestaVoz": "Respuesta natural y corta que dirás en voz alta al usuario. Usa su nombre (${perfil.nombreUsuario}) cuando sea apropiado. Sé ${perfil.personalidad}."
}`;

    try {
      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
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
      });

      const data = await response.json();
      const clasificacion = JSON.parse(data.choices[0].message.content);
      this.logger.log(`Clasificación LLM: ${JSON.stringify(clasificacion)}`);

      // Ejecutar según categoría
      return await this.ejecutarAccion(usuarioId, clasificacion, pcId, perfil);
    } catch (error) {
      this.logger.error(`Error LLM: ${error.message}`);
      return {
        exito: false,
        respuestaVoz: `Disculpa ${perfil.nombreUsuario}, tuve un problema procesando tu comando.`,
        accion: 'error',
      };
    }
  }

  /**
   * Ejecuta la acción clasificada por el LLM
   */
  private async ejecutarAccion(
    usuarioId: string,
    clasificacion: any,
    pcId: string | null,
    perfil: any,
  ) {
    const { categoria, parametros, respuestaVoz } = clasificacion;

    switch (categoria) {
      case 'bloqueo': {
        const duracion = parametros.duracion || 3600;
        const apps = parametros.apps || [];
        let sitios = parametros.sitios || [];

        // Categoría completa
        if (parametros.categoria === 'pornografia') {
          sitios = ['pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com', 'xhamster.com', 'spankbang.com'];
        } else if (parametros.categoria === 'redes_sociales') {
          sitios = ['facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'snapchat.com'];
        }

        const bloqueo = await this.prisma.bloqueo_activo.create({
          data: {
            usuario_id: usuarioId,
            apps_bloqueadas: apps,
            sitios_bloqueados: sitios,
            tiempo_inicio: new Date(),
            tiempo_fin: new Date(Date.now() + duracion * 1000),
            estado: 'activo',
            razon: 'comando_voz',
          },
        });

        // Enviar orden a Tasker vía AutoRemote para ejecutar bloqueo real
        await this.enviarOrdenAutoRemote(`argos_bloquear=:=${JSON.stringify({ apps, sitios, duracion, bloqueoId: bloqueo.id })}`);

        return { exito: true, respuestaVoz, accion: 'bloqueo', detalles: bloqueo };
      }

      case 'desbloqueo': {
        await this.prisma.bloqueo_activo.updateMany({
          where: { usuario_id: usuarioId, estado: 'activo' },
          data: { estado: 'completado' },
        });
        await this.enviarOrdenAutoRemote('argos_desbloquear=:=all');
        return { exito: true, respuestaVoz, accion: 'desbloqueo' };
      }

      case 'turno': {
        if (parametros.accion === 'crear') {
          const turno = await this.prisma.turno.create({
            data: {
              usuario_id: usuarioId,
              hora_inicio: parametros.hora_inicio || '06:00',
              hora_fin: parametros.hora_fin || '14:00',
              tipo_turno: parametros.tipo || 'PERSONALIZADO',
              fecha: new Date(),
              activo: true,
            },
          });
          return { exito: true, respuestaVoz, accion: 'turno_creado', detalles: turno };
        }
        return { exito: true, respuestaVoz, accion: 'turno' };
      }

      case 'alarma': {
        const ahora = new Date();
        let timestamp = ahora;
        if (parametros.hora) {
          const [h, m] = parametros.hora.split(':');
          timestamp = new Date(ahora);
          timestamp.setHours(parseInt(h), parseInt(m), 0, 0);
          if (timestamp <= ahora) timestamp.setDate(timestamp.getDate() + 1);
        }

        const alarma = await this.prisma.alarmas.create({
          data: {
            usuario_id: usuarioId,
            timestamp,
            tipo: 'recordatorio',
            mensaje: parametros.mensaje || 'Recordatorio',
          },
        });

        await this.enviarOrdenAutoRemote(`argos_alarma=:=${JSON.stringify({ id: alarma.id, timestamp: timestamp.toISOString(), mensaje: parametros.mensaje })}`);
        return { exito: true, respuestaVoz, accion: 'alarma', detalles: alarma };
      }

      case 'tarea': {
        if (parametros.accion === 'agregar' || !parametros.accion) {
          const tarea = await this.prisma.tarea.create({
            data: {
              usuario_id: usuarioId,
              titulo: parametros.titulo || 'Tarea sin nombre',
              descripcion: parametros.descripcion || null,
              prioridad: parametros.prioridad || 'media',
            },
          });
          return { exito: true, respuestaVoz, accion: 'tarea_agregada', detalles: tarea };
        } else if (parametros.accion === 'listar') {
          const tareas = await this.prisma.tarea.findMany({
            where: { usuario_id: usuarioId, completada: false },
            orderBy: { prioridad: 'desc' },
            take: 5,
          });
          return { exito: true, respuestaVoz, accion: 'tareas_listadas', detalles: tareas };
        }
        return { exito: true, respuestaVoz, accion: 'tarea' };
      }

      case 'pc': {
        const targetPcId = pcId || await this.obtenerPcActiva(usuarioId);
        if (!targetPcId) {
          return {
            exito: false,
            respuestaVoz: `${perfil.nombreUsuario}, no tienes ninguna PC conectada.`,
            accion: 'pc_error',
          };
        }

        let params = parametros;

        // Obtener URLs si es abrir sitios
        if (parametros.tipoComando === 'abrir_sitios' || parametros.tipoComando === 'abrir_sitios_categoria') {
          const where: any = { usuario_id: usuarioId };
          if (parametros.categoria) where.categoria = parametros.categoria;
          const sitios = await this.prisma.sitio_habitual.findMany({ where, orderBy: { orden: 'asc' } });
          params = { ...parametros, urls: sitios.map((s) => ({ nombre: s.nombre, url: s.url })) };
        }

        const comando = await this.prisma.comando_pc.create({
          data: {
            usuario_id: usuarioId,
            pc_id: targetPcId,
            tipo_comando: parametros.tipoComando || 'abrir_sitios',
            parametros: params,
            estado: 'pendiente',
          },
        });

        return { exito: true, respuestaVoz, accion: 'pc_comando', detalles: comando };
      }

      case 'emergencia': {
        const incidente = await this.prisma.incidente_sos.create({
          data: {
            usuario_id: usuarioId,
            tipo_emergencia: 'SOS',
            estado: 'activo',
          },
        });
        await this.enviarOrdenAutoRemote('argos_sos=:=activar');
        return { exito: true, respuestaVoz, accion: 'emergencia', detalles: incidente };
      }

      case 'estado': {
        const bloqueos = await this.prisma.bloqueo_activo.findMany({
          where: { usuario_id: usuarioId, estado: 'activo' },
        });
        const tareasPendientes = await this.prisma.tarea.count({
          where: { usuario_id: usuarioId, completada: false },
        });
        return {
          exito: true,
          respuestaVoz,
          accion: 'estado',
          detalles: { bloqueosActivos: bloqueos.length, tareasPendientes },
        };
      }

      case 'focus': {
        const duracion = parametros.duracion || 3600;
        const sesion = await this.prisma.sesion_focus.create({
          data: {
            usuario_id: usuarioId,
            hora_fin: new Date(Date.now() + duracion * 1000),
            motivo: parametros.motivo || 'enfoque',
          },
        });
        await this.enviarOrdenAutoRemote(`argos_focus=:=${JSON.stringify({ duracion, motivo: parametros.motivo })}`);
        return { exito: true, respuestaVoz, accion: 'focus', detalles: sesion };
      }

      case 'musica': {
        await this.enviarOrdenAutoRemote(`argos_musica=:=${parametros.accion || 'play'}`);
        return { exito: true, respuestaVoz, accion: 'musica' };
      }

      case 'perfil': {
        const updateData: any = {};
        if (parametros.nombreAsistente) {
          updateData.nombre_asistente = parametros.nombreAsistente;
          updateData.wake_word = parametros.nombreAsistente.toLowerCase();
        }
        if (parametros.generoVoz) updateData.genero_voz = parametros.generoVoz;

        if (Object.keys(updateData).length > 0) {
          await this.prisma.perfil_usuario.update({
            where: { usuario_id: usuarioId },
            data: updateData,
          });
        }
        return { exito: true, respuestaVoz, accion: 'perfil_actualizado' };
      }

      case 'conversacion': {
        // Usar Intelligence para responder preguntas generales
        try {
          const chatResp = await fetch('https://apps.abacus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: `Eres ${perfil.nombreAsistente}, un asistente personal. Tu usuario se llama ${perfil.nombreUsuario}. Responde de forma ${perfil.personalidad}, breve y útil. Máximo 2 oraciones.`,
                },
                { role: 'user', content: parametros.pregunta || clasificacion.parametros?.pregunta || '' },
              ],
              stream: false,
            }),
          });
          const chatData = await chatResp.json();
          const respuesta = chatData.choices[0].message.content;
          return { exito: true, respuestaVoz: respuesta, accion: 'conversacion' };
        } catch {
          return { exito: true, respuestaVoz, accion: 'conversacion' };
        }
      }

      default:
        return { exito: false, respuestaVoz: `No entendí ese comando, ${perfil.nombreUsuario}.`, accion: 'desconocido' };
    }
  }

  // ========== UTILIDADES ==========

  private async obtenerPerfil(usuarioId: string) {
    const perfil = await this.prisma.perfil_usuario.findUnique({ where: { usuario_id: usuarioId } });
    if (perfil) {
      return {
        nombreUsuario: perfil.nombre_usuario,
        nombreAsistente: perfil.nombre_asistente,
        wakeWord: perfil.wake_word,
        generoVoz: perfil.genero_voz,
        personalidad: perfil.personalidad,
      };
    }
    return {
      nombreUsuario: 'Usuario',
      nombreAsistente: 'ARGOS',
      wakeWord: 'argos',
      generoVoz: 'mujer',
      personalidad: 'profesional',
    };
  }

  private limpiarWakeWord(comando: string, wakeWord: string): string {
    const regex = new RegExp(`^\\s*${wakeWord}[,\\s]*`, 'i');
    return comando.replace(regex, '').trim();
  }

  private async obtenerPcActiva(usuarioId: string): Promise<string | null> {
    const pc = await this.prisma.pc_conexion.findFirst({
      where: {
        usuario_id: usuarioId,
        estado: 'conectado',
        ultimo_ping: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      orderBy: { ultimo_ping: 'desc' },
    });
    return pc?.pc_id || null;
  }

  /**
   * Envía respuesta de voz vía AutoRemote para que Tasker la hable
   */
  private async enviarRespuestaAutoRemote(mensaje: string, generoVoz: string) {
    if (!this.AUTOREMOTE_KEY) {
      this.logger.warn('AUTOREMOTE_USER_KEY no configurada');
      return;
    }
    try {
      const payload = `argos_hablar=:=${generoVoz}=:=${mensaje}`;
      const url = `${this.AUTOREMOTE_BASE}/sendmessage?key=${this.AUTOREMOTE_KEY}&message=${encodeURIComponent(payload)}`;
      this.logger.log(`Enviando a AutoRemote: ${payload.substring(0, 100)}...`);
      await fetch(url, { method: 'GET' });
    } catch (error) {
      this.logger.error(`Error enviando a AutoRemote: ${error.message}`);
    }
  }

  /**
   * Envía orden de acción vía AutoRemote para que Tasker ejecute
   */
  private async enviarOrdenAutoRemote(payload: string) {
    if (!this.AUTOREMOTE_KEY) return;
    try {
      const url = `${this.AUTOREMOTE_BASE}/sendmessage?key=${this.AUTOREMOTE_KEY}&message=${encodeURIComponent(payload)}`;
      await fetch(url, { method: 'GET' });
    } catch (error) {
      this.logger.error(`Error enviando orden AutoRemote: ${error.message}`);
    }
  }
}
