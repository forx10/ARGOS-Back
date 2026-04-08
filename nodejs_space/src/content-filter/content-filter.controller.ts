import { Controller, Post, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContentFilterService } from './content-filter.service';

@ApiTags('Content Filter')
@Controller('api/v1/content-filter')
export class ContentFilterController {
  constructor(private readonly contentFilterService: ContentFilterService) {}

  @Post('activate')
  @ApiOperation({
    summary: 'Activate adult content blocking',
    description: 'Blocks access to adult/pornographic websites. Activates when user commands it.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Adult content blocking activated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bloqueo de contenido adulto activado' },
        blockedDomains: { type: 'number', example: 25 },
        totalDomains: { type: 'number', example: 30 },
      },
    },
  })
  async activate(@Query('userId') userId?: string) {
    try {
      return await this.contentFilterService.activateBlocking(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to activate blocking',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('deactivate')
  @ApiOperation({
    summary: 'Deactivate adult content blocking',
    description: 'Removes blocks from adult/pornographic websites',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Adult content blocking deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Bloqueo de contenido adulto desactivado' },
        unblockedDomains: { type: 'number', example: 25 },
      },
    },
  })
  async deactivate(@Query('userId') userId?: string) {
    try {
      return await this.contentFilterService.deactivateBlocking(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to deactivate blocking',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get blocking status',
    description: 'Returns current status of adult content blocking',
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
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean', example: true },
        blockedDomains: { type: 'number', example: 25 },
        totalDomains: { type: 'number', example: 30 },
        percentage: { type: 'number', example: 83 },
      },
    },
  })
  async getStatus(@Query('userId') userId?: string) {
    try {
      return await this.contentFilterService.getBlockingStatus(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('blocked-domains')
  @ApiOperation({
    summary: 'Get list of blocked domains',
    description: 'Returns list of currently blocked adult domains',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blocked domains list retrieved successfully',
  })
  async getBlockedDomains(@Query('userId') userId?: string) {
    try {
      return await this.contentFilterService.getBlockedDomains(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get blocked domains',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
