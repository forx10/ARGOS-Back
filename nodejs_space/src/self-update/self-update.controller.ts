import { Controller, Post, Get, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SelfUpdateService } from './self-update.service';

class AnalyzeCommandDto {
  commandType: string;
  commandDescription: string;
  reason?: string;
  userId?: string;
}

class ApproveUpdateDto {
  userId?: string;
  selectedOption: string;
}

class RejectUpdateDto {
  userId?: string;
  reason?: string;
}

@ApiTags('Self-Update')
@Controller('api/v1/self-update')
export class SelfUpdateController {
  constructor(private readonly selfUpdateService: SelfUpdateService) {}

  @Post('analyze-command')
  @ApiOperation({
    summary: 'Analyze if ARGOS can perform a command',
    description:
      'Checks if ARGOS can perform a task. If not, suggests updates with pros/cons.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        commandType: { type: 'string', example: 'control_hogar' },
        commandDescription: { type: 'string', example: 'Controlar las luces inteligentes' },
        reason: { type: 'string', example: 'Quiero apagar las luces desde mi cama' },
        userId: { type: 'string', example: 'usuario_1' },
      },
      required: ['commandType', 'commandDescription'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Command analysis result with update options',
  })
  async analyzeCommand(@Body() body: AnalyzeCommandDto) {
    try {
      return await this.selfUpdateService.analyzeCommand({
        commandType: body.commandType,
        commandDescription: body.commandDescription,
        reason: body.reason || '',
        userId: body.userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to analyze command',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('approve/:id')
  @ApiOperation({
    summary: 'Approve an update request',
    description: 'Approves an update request and starts the update process.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Update request ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        selectedOption: { type: 'string', example: 'custom_endpoint' },
      },
      required: ['selectedOption'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update approved successfully',
  })
  async approveUpdate(
    @Param('id') id: string,
    @Body() body: ApproveUpdateDto,
  ) {
    try {
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        throw new HttpException('Invalid request ID', HttpStatus.BAD_REQUEST);
      }
      return await this.selfUpdateService.approveUpdate(
        body.userId || 'usuario_1',
        requestId,
        body.selectedOption,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to approve update',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reject/:id')
  @ApiOperation({
    summary: 'Reject an update request',
    description: 'Rejects an update request.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Update request ID',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        reason: { type: 'string', example: 'No me interesa por ahora' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Update rejected successfully',
  })
  async rejectUpdate(
    @Param('id') id: string,
    @Body() body: RejectUpdateDto,
  ) {
    try {
      const requestId = parseInt(id, 10);
      if (isNaN(requestId)) {
        throw new HttpException('Invalid request ID', HttpStatus.BAD_REQUEST);
      }
      return await this.selfUpdateService.rejectUpdate(
        body.userId || 'usuario_1',
        requestId,
        body.reason,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reject update',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get update request history',
    description: 'Returns all update requests for a user.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'User ID (default: usuario_1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Update history retrieved successfully',
  })
  async getHistory(@Query('userId') userId?: string) {
    try {
      return await this.selfUpdateService.getUpdateHistory(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get update history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('system-info')
  @ApiOperation({
    summary: 'Get system information',
    description: 'Returns ARGOS version, installed features, and status.',
  })
  @ApiResponse({
    status: 200,
    description: 'System information retrieved successfully',
  })
  async getSystemInfo() {
    try {
      return await this.selfUpdateService.getSystemInfo();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get system info',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
