import { Controller, Post, Get, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

class NotificationDto {
  app: string;
  title: string;
  text: string;
  sender?: string;
  timestamp?: string;
  userId?: string;
}

class ConfigureVoiceAppsDto {
  userId?: string;
  apps: string[];
}

@ApiTags('Notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('receive')
  @ApiOperation({
    summary: 'Receive notification from Tasker',
    description: 'Receives a notification from Android and generates voice announcement if enabled.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        app: { type: 'string', example: 'WhatsApp' },
        title: { type: 'string', example: 'Juan Pérez' },
        text: { type: 'string', example: 'Hola, ¿cómo estás?' },
        sender: { type: 'string', example: 'Juan Pérez' },
        timestamp: { type: 'string', format: 'date-time', example: '2026-04-08T14:30:00Z' },
        userId: { type: 'string', example: 'usuario_1' },
      },
      required: ['app', 'title', 'text'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification received successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notificación recibida' },
        voiceAnnouncement: { type: 'boolean', example: true },
        voiceMessage: { type: 'string', example: 'Tienes un mensaje de Juan Pérez en WhatsApp' },
      },
    },
  })
  async receiveNotification(@Body() body: NotificationDto) {
    try {
      return await this.notificationsService.receiveNotification({
        app: body.app,
        title: body.title,
        text: body.text,
        sender: body.sender,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        userId: body.userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to receive notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('unannounced')
  @ApiOperation({
    summary: 'Get unannounced notifications',
    description: 'Retrieves all notifications that have not been announced yet.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Unannounced notifications retrieved successfully',
  })
  async getUnannounced(@Query('userId') userId?: string) {
    try {
      return await this.notificationsService.getUnannounced(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get unannounced notifications',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('announce/:id')
  @ApiOperation({
    summary: 'Mark notification as announced',
    description: 'Marks a notification as announced (voice message played).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Notification ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as announced',
  })
  async markAsAnnounced(@Param('id') id: string) {
    try {
      const notificationId = parseInt(id, 10);
      if (isNaN(notificationId)) {
        throw new HttpException('Invalid notification ID', HttpStatus.BAD_REQUEST);
      }
      return await this.notificationsService.markAsAnnounced(notificationId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark as announced',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('configure-voice-apps')
  @ApiOperation({
    summary: 'Configure voice-enabled apps',
    description: 'Configures which apps should trigger voice announcements.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        apps: {
          type: 'array',
          items: { type: 'string' },
          example: ['WhatsApp', 'Telegram', 'Signal'],
        },
      },
      required: ['apps'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Voice-enabled apps configured successfully',
  })
  async configureVoiceApps(@Body() body: ConfigureVoiceAppsDto) {
    try {
      return await this.notificationsService.configureVoiceApps(
        body.userId || 'usuario_1',
        body.apps,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to configure voice apps',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get notification history',
    description: 'Retrieves notification history for a user.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of notifications to retrieve (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully',
  })
  async getHistory(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        throw new HttpException('Limit must be between 1 and 1000', HttpStatus.BAD_REQUEST);
      }
      return await this.notificationsService.getHistory(userId || 'usuario_1', limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
