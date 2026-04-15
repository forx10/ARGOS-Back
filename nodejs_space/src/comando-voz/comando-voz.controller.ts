import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ComandoVozService } from './comando-voz.service';
import { ComandoVozUnificadoService } from './comando-voz-unificado.service';
import { ComandoVozDto, ComandoUnificadoDto } from './dto/comando-voz.dto';

@ApiTags('🎤 Comandos de Voz (Endpoint Principal)')
@Controller('api/comando-voz')
export class ComandoVozController {
  private readonly logger = new Logger(ComandoVozController.name);

  constructor(
    private readonly comandoVozService: ComandoVozService,
    private readonly unificadoService: ComandoVozUnificadoService,
  ) {}

  @Post('unificado')
  @ApiOperation({
    summary: '⭐ ENDPOINT PRINCIPAL - Tasker llama SOLO aquí',
    description: `Recibe cualquier comando de voz y lo enruta al módulo correcto.
    
    Este es el ÚNICO endpoint que Tasker necesita llamar. Ejemplos:
    - "Jarvis bloquea Instagram por 2 horas"
    - "Jarvis abre mis sitios de trabajo en la PC"
    - "Jarvis agrega tarea: hacer ejercicio"
    - "Jarvis modo enfoque 2 horas"
    - "Jarvis emergencia"
    - "Jarvis cómo está el clima"
    - "Jarvis cámbiate el nombre a Friday"
    
    El backend:
    1. Detecta el wake word y lo limpia
    2. Clasifica el comando con IA
    3. Ejecuta la acción correspondiente
    4. Envía respuesta por AutoRemote para que Tasker la diga en voz alta`,
  })
  @ApiBody({ type: ComandoUnificadoDto })
  @ApiResponse({
    status: 201,
    description: 'Comando procesado y respuesta enviada a AutoRemote',
    schema: {
      example: {
        exito: true,
        respuestaVoz: '¡Listo Luis! Instagram bloqueado por 2 horas.',
        accion: 'bloqueo',
        detalles: {},
        perfil: { nombreAsistente: 'Jarvis', generoVoz: 'hombre' },
      },
    },
  })
  async procesarUnificado(@Body() dto: ComandoUnificadoDto) {
    this.logger.log(`POST /api/comando-voz/unificado - "${dto.comando}"`);
    return this.unificadoService.procesarComandoUnificado(dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Procesar comando de voz (legacy)',
    description: 'Endpoint original. Usa /unificado para la nueva integración con Tasker.',
  })
  async procesarComando(@Body() comandoDto: ComandoVozDto) {
    return this.comandoVozService.procesarComando(comandoDto);
  }
}
