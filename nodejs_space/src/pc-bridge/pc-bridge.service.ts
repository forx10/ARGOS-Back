import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPcDto, AddSiteDto, AddMultipleSitesDto, SendCommandDto, PcPingDto } from './dto/pc-bridge.dto';

@Injectable()
export class PcBridgeService {
  private readonly logger = new Logger(PcBridgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Registrar una PC
  async registerPc(dto: RegisterPcDto) {
    this.logger.log(`Registrando PC ${dto.pcId} para usuario ${dto.usuarioId}`);

    const pc = await this.prisma.pc_conexion.upsert({
      where: { pc_id: dto.pcId },
      update: {
        nombre_pc: dto.nombrePc,
        sistema_operativo: dto.sistemaOperativo,
        ip_local: dto.ipLocal,
        estado: 'conectado',
        ultimo_ping: new Date(),
      },
      create: {
        usuario_id: dto.usuarioId,
        pc_id: dto.pcId,
        nombre_pc: dto.nombrePc,
        sistema_operativo: dto.sistemaOperativo,
        ip_local: dto.ipLocal,
        estado: 'conectado',
        ultimo_ping: new Date(),
      },
    });

    return {
      success: true,
      pc,
      mensaje: `PC "${dto.nombrePc}" registrada exitosamente. Ahora puedes enviar comandos desde tu teléfono.`,
    };
  }

  // Ping desde PC (mantener conexión activa)
  async pingPc(dto: PcPingDto) {
    const pc = await this.prisma.pc_conexion.update({
      where: { pc_id: dto.pcId },
      data: {
        estado: 'conectado',
        ultimo_ping: new Date(),
        ip_local: dto.ipLocal,
      },
    });
    return { online: true, pcId: pc.pc_id };
  }

  // Obtener PCs del usuario
  async getUserPcs(usuarioId: string) {
    const pcs = await this.prisma.pc_conexion.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { ultimo_ping: 'desc' },
    });

    // Marcar como desconectado si no hizo ping en 5 min
    const now = new Date();
    const result = pcs.map((pc) => ({
      ...pc,
      estado: pc.ultimo_ping && (now.getTime() - pc.ultimo_ping.getTime()) < 300000
        ? 'conectado'
        : 'desconectado',
    }));

    return { pcs: result };
  }

  // ========== SITIOS HABITUALES ==========

  // Agregar un sitio habitual
  async addSite(dto: AddSiteDto) {
    this.logger.log(`Agregando sitio ${dto.nombre} (${dto.url}) para ${dto.usuarioId}`);

    const sitio = await this.prisma.sitio_habitual.create({
      data: {
        usuario_id: dto.usuarioId,
        nombre: dto.nombre,
        url: dto.url,
        categoria: dto.categoria || 'general',
        abrir_al_inicio: dto.abrirAlInicio || false,
        orden: dto.orden || 0,
      },
    });

    return {
      success: true,
      sitio,
      mensaje: `Sitio "${dto.nombre}" guardado. La próxima vez solo di "abre ${dto.nombre}" o "abre mis sitios de ${dto.categoria || 'general'}"`,
    };
  }

  // Agregar múltiples sitios de una vez
  async addMultipleSites(dto: AddMultipleSitesDto) {
    this.logger.log(`Agregando ${dto.sitios.length} sitios para ${dto.usuarioId}`);

    const sitios = await this.prisma.$transaction(
      dto.sitios.map((s, i) =>
        this.prisma.sitio_habitual.create({
          data: {
            usuario_id: dto.usuarioId,
            nombre: s.nombre,
            url: s.url,
            categoria: s.categoria || 'general',
            abrir_al_inicio: s.abrirAlInicio || false,
            orden: s.orden || i,
          },
        }),
      ),
    );

    return {
      success: true,
      cantidad: sitios.length,
      sitios,
      mensaje: `${sitios.length} sitios guardados. Ahora puedes decir "abre mis sitios de trabajo" o "abre todos mis sitios"`,
    };
  }

  // Obtener sitios del usuario
  async getSites(usuarioId: string, categoria?: string) {
    const where: any = { usuario_id: usuarioId };
    if (categoria) where.categoria = categoria;

    const sitios = await this.prisma.sitio_habitual.findMany({
      where,
      orderBy: { orden: 'asc' },
    });

    return { sitios, total: sitios.length };
  }

  // Eliminar un sitio
  async deleteSite(siteId: number) {
    await this.prisma.sitio_habitual.delete({ where: { id: siteId } });
    return { success: true, mensaje: 'Sitio eliminado' };
  }

  // ========== COMANDOS AL PC ==========

  // Enviar comando al PC
  async sendCommand(dto: SendCommandDto) {
    this.logger.log(`Enviando comando ${dto.tipoComando} a PC ${dto.pcId}`);

    let parametros = dto.parametros || {};

    // Si es "abrir_sitios", obtener todos los sitios
    if (dto.tipoComando === 'abrir_sitios') {
      const sitios = await this.prisma.sitio_habitual.findMany({
        where: { usuario_id: dto.usuarioId },
        orderBy: { orden: 'asc' },
      });
      parametros = { urls: sitios.map((s) => ({ nombre: s.nombre, url: s.url })) };
    }

    // Si es "abrir_sitios_categoria", filtrar por categoría
    if (dto.tipoComando === 'abrir_sitios_categoria' && parametros.categoria) {
      const sitios = await this.prisma.sitio_habitual.findMany({
        where: { usuario_id: dto.usuarioId, categoria: parametros.categoria },
        orderBy: { orden: 'asc' },
      });
      parametros = { ...parametros, urls: sitios.map((s) => ({ nombre: s.nombre, url: s.url })) };
    }

    const comando = await this.prisma.comando_pc.create({
      data: {
        usuario_id: dto.usuarioId,
        pc_id: dto.pcId,
        tipo_comando: dto.tipoComando,
        parametros,
        estado: 'pendiente',
      },
    });

    return {
      success: true,
      comando,
      mensaje: `Comando "${dto.tipoComando}" enviado a la PC. Esperando ejecución...`,
    };
  }

  // PC consulta si hay comandos pendientes (polling)
  async getPendingCommands(pcId: string) {
    const comandos = await this.prisma.comando_pc.findMany({
      where: { pc_id: pcId, estado: 'pendiente' },
      orderBy: { creado_en: 'asc' },
    });
    return { comandos, total: comandos.length };
  }

  // PC reporta resultado de un comando
  async reportCommandResult(commandId: number, resultado: string, exito: boolean) {
    const comando = await this.prisma.comando_pc.update({
      where: { id: commandId },
      data: {
        estado: exito ? 'ejecutado' : 'error',
        resultado,
        ejecutado_en: new Date(),
      },
    });
    return { success: true, comando };
  }
}
