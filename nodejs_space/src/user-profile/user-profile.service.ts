import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetupProfileDto, UpdateProfileDto } from './dto/setup-profile.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Configuración inicial (onboarding)
  async setupProfile(dto: SetupProfileDto) {
    this.logger.log(`Configurando perfil para ${dto.usuarioId}`);

    const nombreAsistente = dto.nombreAsistente || 'ARGOS';
    const generoVoz = dto.generoVoz || 'mujer';
    const personalidad = dto.personalidad || 'profesional';

    // Generar saludo personalizado
    const saludo = this.generarSaludo(dto.nombreUsuario, nombreAsistente, personalidad);

    const perfil = await this.prisma.perfil_usuario.upsert({
      where: { usuario_id: dto.usuarioId },
      update: {
        nombre_usuario: dto.nombreUsuario,
        nombre_asistente: nombreAsistente,
        wake_word: nombreAsistente.toLowerCase(),
        genero_voz: generoVoz,
        personalidad,
        saludo_personalizado: saludo,
        configurado: true,
      },
      create: {
        usuario_id: dto.usuarioId,
        nombre_usuario: dto.nombreUsuario,
        nombre_asistente: nombreAsistente,
        wake_word: nombreAsistente.toLowerCase(),
        genero_voz: generoVoz,
        personalidad,
        saludo_personalizado: saludo,
        configurado: true,
      },
    });

    return {
      perfil,
      mensaje: `¡Perfecto ${dto.nombreUsuario}! A partir de ahora me llamo ${nombreAsistente}. Puedes activarme diciendo "${nombreAsistente}". Mi voz será de ${generoVoz}.`,
      taskerConfig: {
        wakeWord: nombreAsistente.toLowerCase(),
        voiceGender: generoVoz,
        autoVoiceKeyword: nombreAsistente.toLowerCase(),
        ttsEngine: generoVoz === 'mujer' ? 'es-US-language' : 'es-US-language',
        ttsVoice: generoVoz === 'mujer' ? 'es-us-x-sfb-local' : 'es-us-x-sfb-local',
      },
    };
  }

  // Obtener perfil
  async getProfile(usuarioId: string) {
    const perfil = await this.prisma.perfil_usuario.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!perfil) {
      return {
        configurado: false,
        mensaje: 'Hola, soy ARGOS. ¿Cómo te llamas?',
        pasoActual: 'nombre_usuario',
      };
    }

    return {
      configurado: perfil.configurado,
      perfil,
      saludo: perfil.saludo_personalizado,
    };
  }

  // Actualizar perfil
  async updateProfile(usuarioId: string, dto: UpdateProfileDto) {
    const perfil = await this.prisma.perfil_usuario.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!perfil) {
      return { error: true, mensaje: 'Perfil no encontrado. Usa /setup primero.' };
    }

    const updateData: any = {};
    if (dto.nombreAsistente) {
      updateData.nombre_asistente = dto.nombreAsistente;
      updateData.wake_word = dto.nombreAsistente.toLowerCase();
    }
    if (dto.generoVoz) updateData.genero_voz = dto.generoVoz;
    if (dto.personalidad) {
      updateData.personalidad = dto.personalidad;
      updateData.saludo_personalizado = this.generarSaludo(
        perfil.nombre_usuario,
        dto.nombreAsistente || perfil.nombre_asistente,
        dto.personalidad,
      );
    }
    if (dto.idioma) updateData.idioma = dto.idioma;

    const updated = await this.prisma.perfil_usuario.update({
      where: { usuario_id: usuarioId },
      data: updateData,
    });

    return {
      perfil: updated,
      mensaje: `Listo, configuración actualizada.`,
      taskerConfig: {
        wakeWord: updated.wake_word,
        voiceGender: updated.genero_voz,
        autoVoiceKeyword: updated.wake_word,
      },
    };
  }

  // Obtener configuración para Tasker/AutoVoice
  async getTaskerConfig(usuarioId: string) {
    const perfil = await this.prisma.perfil_usuario.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!perfil) {
      return {
        wakeWord: 'argos',
        voiceGender: 'mujer',
        nombreUsuario: 'Usuario',
        saludo: 'Hola, soy ARGOS. ¿En qué te ayudo?',
      };
    }

    return {
      wakeWord: perfil.wake_word,
      voiceGender: perfil.genero_voz,
      nombreUsuario: perfil.nombre_usuario,
      nombreAsistente: perfil.nombre_asistente,
      saludo: perfil.saludo_personalizado,
      personalidad: perfil.personalidad,
      idioma: perfil.idioma,
    };
  }

  private generarSaludo(nombre: string, asistente: string, personalidad: string): string {
    switch (personalidad) {
      case 'amigable':
        return `¡Hey ${nombre}! Soy ${asistente}, tu asistente. ¿Qué hacemos hoy?`;
      case 'formal':
        return `Buenos días ${nombre}. Soy ${asistente}, su asistente personal. ¿En qué puedo servirle?`;
      case 'profesional':
      default:
        return `Hola ${nombre}, soy ${asistente}. ¿En qué te puedo ayudar?`;
    }
  }
}
