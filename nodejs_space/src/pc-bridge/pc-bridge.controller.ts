import { Controller, Post, Get, Delete, Body, Param, Query, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PcBridgeService } from './pc-bridge.service';
import { RegisterPcDto, AddSiteDto, AddMultipleSitesDto, SendCommandDto, PcPingDto } from './dto/pc-bridge.dto';

@ApiTags('🖥️ PC Bridge (Integración con Computadora)')
@Controller('api/v1/pc')
export class PcBridgeController {
  private readonly logger = new Logger(PcBridgeController.name);

  constructor(private readonly pcBridgeService: PcBridgeService) {}

  // ========== GESTIÓN DE PC ==========

  @Post('register')
  @ApiOperation({
    summary: 'Registrar una PC',
    description: 'El cliente de PC se registra con ARGOS. Necesitas un script corriendo en tu PC que haga polling de comandos.',
  })
  async registerPc(@Body() dto: RegisterPcDto) {
    this.logger.log(`POST /api/v1/pc/register - PC: ${dto.pcId}`);
    return this.pcBridgeService.registerPc(dto);
  }

  @Post('ping')
  @ApiOperation({
    summary: 'Ping desde PC (mantener online)',
    description: 'El script de PC envía un ping cada 2-3 minutos para indicar que está online',
  })
  async pingPc(@Body() dto: PcPingDto) {
    return this.pcBridgeService.pingPc(dto);
  }

  @Get('user/:usuarioId')
  @ApiOperation({ summary: 'Listar PCs del usuario' })
  async getUserPcs(@Param('usuarioId') usuarioId: string) {
    return this.pcBridgeService.getUserPcs(usuarioId);
  }

  // ========== SITIOS HABITUALES ==========

  @Post('sites')
  @ApiOperation({
    summary: 'Agregar un sitio habitual',
    description: 'Guarda un sitio web que el usuario visita frecuentemente. Solo necesitas decírselo una vez.',
  })
  async addSite(@Body() dto: AddSiteDto) {
    this.logger.log(`POST /api/v1/pc/sites - Sitio: ${dto.nombre}`);
    return this.pcBridgeService.addSite(dto);
  }

  @Post('sites/batch')
  @ApiOperation({
    summary: 'Agregar múltiples sitios de una vez',
    description: 'Configura todos tus sitios habituales en un solo paso. Ej: "Mis sitios de trabajo son Gmail, GitHub y Jira"',
  })
  async addMultipleSites(@Body() dto: AddMultipleSitesDto) {
    this.logger.log(`POST /api/v1/pc/sites/batch - ${dto.sitios.length} sitios`);
    return this.pcBridgeService.addMultipleSites(dto);
  }

  @Get('sites/:usuarioId')
  @ApiOperation({ summary: 'Listar sitios habituales del usuario' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría', enum: ['trabajo', 'personal', 'entretenimiento', 'general'] })
  async getSites(@Param('usuarioId') usuarioId: string, @Query('categoria') categoria?: string) {
    return this.pcBridgeService.getSites(usuarioId, categoria);
  }

  @Delete('sites/:id')
  @ApiOperation({ summary: 'Eliminar un sitio habitual' })
  async deleteSite(@Param('id', ParseIntPipe) id: number) {
    return this.pcBridgeService.deleteSite(id);
  }

  // ========== COMANDOS A LA PC ==========

  @Post('command')
  @ApiOperation({
    summary: 'Enviar comando a la PC desde el teléfono',
    description: 'Ejemplo: "ARGOS, vamos a la PC y abre mis sitios de trabajo". Tipos: abrir_sitios, abrir_sitios_categoria, abrir_app, escribir, ejecutar, cerrar_todo',
  })
  @ApiResponse({ status: 201, description: 'Comando enviado. La PC lo ejecutará en el próximo polling.' })
  async sendCommand(@Body() dto: SendCommandDto) {
    this.logger.log(`POST /api/v1/pc/command - ${dto.tipoComando} a ${dto.pcId}`);
    return this.pcBridgeService.sendCommand(dto);
  }

  @Get('commands/:pcId/pending')
  @ApiOperation({
    summary: 'Obtener comandos pendientes (llamado por la PC)',
    description: 'El script de PC consulta cada 3-5 segundos si hay comandos nuevos para ejecutar',
  })
  async getPendingCommands(@Param('pcId') pcId: string) {
    return this.pcBridgeService.getPendingCommands(pcId);
  }

  @Post('commands/:id/result')
  @ApiOperation({
    summary: 'Reportar resultado de un comando (llamado por la PC)',
    description: 'Después de ejecutar un comando, la PC reporta si fue exitoso o hubo error',
  })
  async reportResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { resultado: string; exito: boolean },
  ) {
    return this.pcBridgeService.reportCommandResult(id, body.resultado, body.exito);
  }
}
