import { Controller, Post, Get, Body, Param, Logger, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

@ApiTags('Webhook')
@Controller('api/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('tasker')
  @ApiOperation({ summary: 'Webhook listener para eventos de Tasker/AutoRemote' })
  @ApiResponse({
    status: 200,
    description: 'Evento procesado',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          properties: {
            exito: { type: 'boolean' },
            mensaje: { type: 'string' },
          },
        },
      },
    },
  })
  async recibirEventoTasker(
    @Body()
    body: any,
  ) {
    this.logger.log(`POST /api/webhook/tasker - Evento recibido: ${JSON.stringify(body)}`);

    const resultado = await this.webhookService.procesarEventoTasker(body);

    return {
      success: resultado.exito,
      data: resultado,
    };
  }

  @Get('tasker/estado/:bloqueoId')
  @ApiOperation({ summary: 'Obtener estado de bloqueo' })
  @ApiResponse({
    status: 200,
    description: 'Estado del bloqueo',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  async obtenerEstadoBloqueo(@Param('bloqueoId', ParseIntPipe) bloqueoId: number) {
    this.logger.log(`GET /api/webhook/tasker/estado/:bloqueoId - ID: ${bloqueoId}`);
    const estado = await this.webhookService.obtenerEstadoBloqueo(bloqueoId);
    return {
      success: true,
      data: estado,
    };
  }
}
