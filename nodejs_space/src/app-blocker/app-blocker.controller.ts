import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AppBlockerService } from './app-blocker.service';

class BlockAppsDto {
  userId?: string;
  apps: string[];
  hours?: number;
}

@ApiTags('App Blocker')
@Controller('api/v1/app-blocker')
export class AppBlockerController {
  constructor(private readonly appBlockerService: AppBlockerService) {}

  @Post('activate')
  @ApiOperation({
    summary: 'Activate UNBREAKABLE app blocking',
    description: 'Blocks specified apps for a given time. CANNOT be disabled until time expires.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        apps: {
          type: 'array',
          items: { type: 'string' },
          example: ['Instagram', 'Facebook', 'TikTok'],
          description: 'List of app names to block',
        },
        hours: { type: 'number', example: 1, description: 'Hours to block (default: 1, max: 24)' },
      },
      required: ['apps'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'App blocking activated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Listo, 3 apps bloqueadas por 1 hora' },
        blockedApps: { type: 'array', items: { type: 'string' } },
        blockedUntil: { type: 'string', format: 'date-time' },
        hours: { type: 'number', example: 1 },
        unbreakable: { type: 'boolean', example: true },
      },
    },
  })
  async activate(@Body() body: BlockAppsDto) {
    try {
      if (!body.apps || body.apps.length === 0) {
        throw new HttpException('Apps list is required', HttpStatus.BAD_REQUEST);
      }

      const hours = body.hours || 1;
      if (hours < 1 || hours > 24) {
        throw new HttpException('Hours must be between 1 and 24', HttpStatus.BAD_REQUEST);
      }

      return await this.appBlockerService.activateBlocking(
        body.userId || 'usuario_1',
        body.apps,
        hours,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to activate app blocking',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('deactivate')
  @ApiOperation({
    summary: 'Attempt to deactivate app blocking',
    description: 'Tries to deactivate app blocking. Will FAIL if time has not expired.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Deactivation attempt result',
  })
  async deactivate(@Query('userId') userId?: string) {
    try {
      return await this.appBlockerService.deactivateBlocking(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to deactivate app blocking',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get app blocking status',
    description: 'Returns current status of app blocking',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blocking status retrieved successfully',
  })
  async getStatus(@Query('userId') userId?: string) {
    try {
      return await this.appBlockerService.getBlockingStatus(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
