import { Injectable, Logger } from '@nestjs/common';
import { EdgeTTS } from '@andresaya/edge-tts';
import * as crypto from 'crypto';

/**
 * Voces seleccionadas para ARGOS:
 * - Hombre (JARVIS): es-CO-GonzaloNeural con pitch bajo y velocidad calmada
 * - Mujer: es-CO-SalomeNeural con tono natural
 */

export interface VoceDisponible {
  id: string;
  nombre: string;
  genero: 'hombre' | 'mujer';
  locale: string;
  edgeVoice: string;
  pitch: string;
  rate: string;
  descripcion: string;
}

export const VOCES_ARGOS: VoceDisponible[] = [
  {
    id: 'jarvis',
    nombre: 'Jarvis',
    genero: 'hombre',
    locale: 'es-CO',
    edgeVoice: 'es-CO-GonzaloNeural',
    pitch: '-25Hz',   // Mucho más grave para sonar como JARVIS
    rate: '-5%',       // Ligeramente más lento, calmado
    descripcion: 'Voz masculina grave y calmada estilo JARVIS',
  },
  {
    id: 'gonzalo',
    nombre: 'Gonzalo',
    genero: 'hombre',
    locale: 'es-CO',
    edgeVoice: 'es-CO-GonzaloNeural',
    pitch: '+0Hz',
    rate: '+0%',
    descripcion: 'Voz masculina colombiana natural',
  },
  {
    id: 'alvaro',
    nombre: 'Álvaro',
    genero: 'hombre',
    locale: 'es-ES',
    edgeVoice: 'es-ES-AlvaroNeural',
    pitch: '-8Hz',
    rate: '-3%',
    descripcion: 'Voz masculina española grave',
  },
  {
    id: 'jorge',
    nombre: 'Jorge',
    genero: 'hombre',
    locale: 'es-MX',
    edgeVoice: 'es-MX-JorgeNeural',
    pitch: '-5Hz',
    rate: '+0%',
    descripcion: 'Voz masculina mexicana',
  },
  {
    id: 'salome',
    nombre: 'Salomé',
    genero: 'mujer',
    locale: 'es-CO',
    edgeVoice: 'es-CO-SalomeNeural',
    pitch: '+0Hz',
    rate: '+0%',
    descripcion: 'Voz femenina colombiana natural',
  },
  {
    id: 'elvira',
    nombre: 'Elvira',
    genero: 'mujer',
    locale: 'es-ES',
    edgeVoice: 'es-ES-ElviraNeural',
    pitch: '+0Hz',
    rate: '+0%',
    descripcion: 'Voz femenina española',
  },
  {
    id: 'dalia',
    nombre: 'Dalia',
    genero: 'mujer',
    locale: 'es-MX',
    edgeVoice: 'es-MX-DaliaNeural',
    pitch: '+0Hz',
    rate: '+0%',
    descripcion: 'Voz femenina mexicana',
  },
];

interface AudioCache {
  buffer: Buffer;
  createdAt: number;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  // Cache en memoria con TTL de 10 minutos
  private audioCache = new Map<string, AudioCache>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
  private readonly MAX_CACHE_SIZE = 50; // máximo 50 audios en cache

  constructor() {
    // No usar setInterval (containers se suspenden).
    // La limpieza se hace on-demand al guardar nuevos audios.
  }

  /**
   * Genera audio MP3 a partir de texto usando Edge TTS
   * Retorna un ID único para descargar el audio
   */
  async generarAudio(
    texto: string,
    vozId: string = 'jarvis',
  ): Promise<{ audioId: string; audioUrl: string }> {
    const voz = VOCES_ARGOS.find((v) => v.id === vozId);
    if (!voz) {
      throw new Error(`Voz no encontrada: ${vozId}`);
    }

    this.logger.log(
      `Generando audio con voz "${voz.nombre}" (${voz.edgeVoice}): "${texto.substring(0, 80)}..."`,
    );

    try {
      const tts = new EdgeTTS();
      await tts.synthesize(texto, voz.edgeVoice, {
        pitch: voz.pitch,
        rate: voz.rate,
        volume: '+0%',
      });

      const audioBuffer = await tts.toBuffer();
      const audioId = crypto.randomUUID();

      // Guardar en cache
      this.audioCache.set(audioId, {
        buffer: audioBuffer,
        createdAt: Date.now(),
      });

      // Limpiar si excede el máximo
      if (this.audioCache.size > this.MAX_CACHE_SIZE) {
        this.limpiarCache();
      }

      const baseUrl = (process.env.APP_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
      const audioUrl = `${baseUrl}/api/tts/audio/${audioId}`;

      this.logger.log(
        `Audio generado: ${audioId} (${audioBuffer.length} bytes)`,
      );

      return { audioId, audioUrl };
    } catch (error) {
      this.logger.error(`Error generando audio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera audio y retorna directamente como buffer (para streaming)
   */
  async generarAudioBuffer(
    texto: string,
    vozId: string = 'jarvis',
  ): Promise<Buffer> {
    const voz = VOCES_ARGOS.find((v) => v.id === vozId);
    if (!voz) {
      throw new Error(`Voz no encontrada: ${vozId}`);
    }

    const tts = new EdgeTTS();
    await tts.synthesize(texto, voz.edgeVoice, {
      pitch: voz.pitch,
      rate: voz.rate,
      volume: '+0%',
    });

    return tts.toBuffer();
  }

  /**
   * Obtiene un audio generado previamente por su ID
   */
  obtenerAudio(audioId: string): Buffer | null {
    const cached = this.audioCache.get(audioId);
    if (!cached) return null;

    // Verificar si expiró
    if (Date.now() - cached.createdAt > this.CACHE_TTL_MS) {
      this.audioCache.delete(audioId);
      return null;
    }

    return cached.buffer;
  }

  /**
   * Lista todas las voces disponibles
   */
  listarVoces(): VoceDisponible[] {
    return VOCES_ARGOS;
  }

  /**
   * Obtiene la voz predeterminada según el género del perfil de usuario
   */
  obtenerVozPorGenero(genero: string): VoceDisponible {
    if (genero === 'mujer') {
      return VOCES_ARGOS.find((v) => v.id === 'salome')!;
    }
    // Por defecto: JARVIS
    return VOCES_ARGOS.find((v) => v.id === 'jarvis')!;
  }

  /**
   * Limpia audios expirados del cache
   */
  private limpiarCache() {
    const now = Date.now();
    let eliminados = 0;
    for (const [id, cached] of this.audioCache.entries()) {
      if (now - cached.createdAt > this.CACHE_TTL_MS) {
        this.audioCache.delete(id);
        eliminados++;
      }
    }
    if (eliminados > 0) {
      this.logger.log(`Cache limpiado: ${eliminados} audios eliminados`);
    }
  }
}
