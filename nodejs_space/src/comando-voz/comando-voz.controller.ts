import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComandoVozService } from './comando-voz.service';
import { ComandoVozDto } from './dto/comando-voz.dto';

@ApiTags('Comandos de Voz')
@Controller('api/comando-voz')
export class ComandoVozController {
  constructor(private readonly comandoVozService: ComandoVozService) {}

  @Post()
  @ApiOperation({
    summary: 'Procesar comando de voz',
    description:
      'Recibe un comando de voz (texto o audio base64), lo parsea con LLM y ejecuta la acción correspondiente. Ejemplos: "ARGOS bloquea Instagram por 2 horas", "ARGOS agregar alarma a las 4:15am para turno 1", "ARGOS hoy a las 3 voy a estudiar"',
  })
  @ApiResponse({
    status: 200,
    description: 'Comando procesado exitosamente',
    schema: {
      example: {
        exito: true,
        mensaje: 'Instagram bloqueado por 2 horas',
        accion: 'bloqueo_inmediato',
        detalles: {
          apps: ['com.instagram.android'],
          duracion: 7200,
        },
      },
    },
  })
  async procesarComando(@Body() comandoDto: ComandoVozDto) {
    return this.comandoVozService.procesarComando(comandoDto);
  }
}
