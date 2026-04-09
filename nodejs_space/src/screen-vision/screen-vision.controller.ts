import { Controller, Post, Get, Delete, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ScreenVisionService } from './screen-vision.service';

class AnalyzeScreenDto {
  imageBase64: string;
  context?: string;
  userId?: string;
}

@ApiTags('Screen Vision')
@Controller('api/v1/screen-vision')
export class ScreenVisionController {
  constructor(private readonly screenVisionService: ScreenVisionService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze screen with AI vision',
    description:
      'Send a screenshot and ARGOS will analyze it with AI to help you solve problems.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageBase64: {
          type: 'string',
          description: 'Base64 encoded screenshot',
          example: 'iVBORw0KGgoAAAANS...',
        },
        context: {
          type: 'string',
          description: 'What problem are you experiencing?',
          example: 'La aplicación se congela cuando intento abrir archivos',
        },
        userId: { type: 'string', example: 'usuario_1' },
      },
      required: ['imageBase64'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Screen analyzed successfully',
    schema: {
      type: 'object',
      properties: {
        screenshotId: { type: 'number' },
        analysis: { type: 'string' },
        suggestions: { type: 'array', items: { type: 'string' } },
        helpfulLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async analyzeScreen(@Body() body: AnalyzeScreenDto) {
    try {
      if (!body.imageBase64 || body.imageBase64.length === 0) {
        throw new HttpException(
          'Image base64 is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.screenVisionService.analyzeScreen({
        imageBase64: body.imageBase64,
        context: body.context,
        userId: body.userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to analyze screen',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get screenshot history',
    description: 'Returns all screenshots analyzed for a user.',
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
    description: 'Number of screenshots (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'History retrieved successfully',
  })
  async getHistory(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
      }
      return await this.screenVisionService.getHistory(userId || 'usuario_1', limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get screenshot details',
    description: 'Get detailed analysis of a specific screenshot.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Screenshot ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Screenshot details retrieved successfully',
  })
  async getDetails(@Param('id') id: string) {
    try {
      const screenshotId = parseInt(id, 10);
      if (isNaN(screenshotId)) {
        throw new HttpException('Invalid screenshot ID', HttpStatus.BAD_REQUEST);
      }
      return await this.screenVisionService.getDetails(screenshotId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get screenshot details',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete screenshot',
    description: 'Delete a specific screenshot from history.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Screenshot ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Screenshot deleted successfully',
  })
  async deleteScreenshot(@Param('id') id: string) {
    try {
      const screenshotId = parseInt(id, 10);
      if (isNaN(screenshotId)) {
        throw new HttpException('Invalid screenshot ID', HttpStatus.BAD_REQUEST);
      }
      return await this.screenVisionService.deleteScreenshot(screenshotId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete screenshot',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/')
  @ApiOperation({
    summary: 'Clear all screenshots',
    description: 'Delete all screenshots for privacy.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'All screenshots deleted successfully',
  })
  async clearAll(@Query('userId') userId?: string) {
    try {
      return await this.screenVisionService.clearAll(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to clear screenshots',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
