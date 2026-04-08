import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MusicService } from './music.service';

class VolumeDto {
  level: number; // 0-100
}

@ApiTags('Music Control')
@Controller('api/v1/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post('play')
  @ApiOperation({ 
    summary: 'Play/Resume music',
    description: 'Sends a command to Tasker to play or resume music playback'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Play command sent successfully',
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', example: 'play' },
        message: { type: 'string', example: 'Reproduciendo música' },
        tasker_intent: { type: 'string', example: 'android.intent.action.MEDIA_BUTTON' }
      }
    }
  })
  async play() {
    try {
      await this.musicService.logCommand('play');
      return {
        action: 'play',
        message: 'Reproduciendo música',
        tasker_intent: 'android.intent.action.MEDIA_BUTTON',
        tasker_action: 'Media Control',
        tasker_value: 'Play',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to play music',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('pause')
  @ApiOperation({ 
    summary: 'Pause music',
    description: 'Sends a command to Tasker to pause music playback'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pause command sent successfully',
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', example: 'pause' },
        message: { type: 'string', example: 'Música pausada' }
      }
    }
  })
  async pause() {
    try {
      await this.musicService.logCommand('pause');
      return {
        action: 'pause',
        message: 'Música pausada',
        tasker_intent: 'android.intent.action.MEDIA_BUTTON',
        tasker_action: 'Media Control',
        tasker_value: 'Pause',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to pause music',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('next')
  @ApiOperation({ 
    summary: 'Next track',
    description: 'Sends a command to Tasker to skip to the next track'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Next track command sent successfully'
  })
  async next() {
    try {
      await this.musicService.logCommand('next');
      return {
        action: 'next',
        message: 'Siguiente canción',
        tasker_intent: 'android.intent.action.MEDIA_BUTTON',
        tasker_action: 'Media Control',
        tasker_value: 'Next',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to skip to next track',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('previous')
  @ApiOperation({ 
    summary: 'Previous track',
    description: 'Sends a command to Tasker to go to the previous track'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Previous track command sent successfully'
  })
  async previous() {
    try {
      await this.musicService.logCommand('previous');
      return {
        action: 'previous',
        message: 'Canción anterior',
        tasker_intent: 'android.intent.action.MEDIA_BUTTON',
        tasker_action: 'Media Control',
        tasker_value: 'Previous',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to go to previous track',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('volume')
  @ApiOperation({ 
    summary: 'Set volume level',
    description: 'Sends a command to Tasker to adjust the volume level (0-100)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        level: { 
          type: 'number', 
          example: 50,
          description: 'Volume level (0-100)',
          minimum: 0,
          maximum: 100
        }
      },
      required: ['level']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Volume adjusted successfully'
  })
  @ApiResponse({ status: 400, description: 'Invalid volume level' })
  async setVolume(@Body() body: VolumeDto) {
    try {
      if (!body.level && body.level !== 0) {
        throw new HttpException('Volume level is required', HttpStatus.BAD_REQUEST);
      }

      if (body.level < 0 || body.level > 100) {
        throw new HttpException('Volume level must be between 0 and 100', HttpStatus.BAD_REQUEST);
      }

      await this.musicService.logCommand(`volume:${body.level}`);
      return {
        action: 'volume',
        level: body.level,
        message: `Volumen ajustado a ${body.level}%`,
        tasker_action: 'Audio Volume',
        tasker_value: Math.round((body.level / 100) * 15), // Android volume scale 0-15
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to set volume',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @ApiOperation({ 
    summary: 'Get music control history',
    description: 'Retrieves the history of music control commands'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return (default: 10)',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'History retrieved successfully'
  })
  async getHistory(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      return await this.musicService.getHistory(limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
