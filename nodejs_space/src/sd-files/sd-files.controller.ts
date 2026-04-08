import { Controller, Post, Get, Delete, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SdFilesService } from './sd-files.service';

class IndexFilesDto {
  userId?: string;
  files: Array<{
    nombre: string;
    rutaCompleta: string;
    tipo?: string;
    tamanoBytes?: number;
    extension?: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
  }>;
}

@ApiTags('SD Card Files')
@Controller('api/v1/sd-files')
export class SdFilesController {
  constructor(private readonly sdFilesService: SdFilesService) {}

  @Post('index')
  @ApiOperation({
    summary: 'Index files from SD card',
    description: 'Receives file list from Tasker and indexes them in the database.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nombre: { type: 'string', example: 'foto_vacaciones.jpg' },
              rutaCompleta: { type: 'string', example: '/sdcard/DCIM/Camera/foto_vacaciones.jpg' },
              tipo: { type: 'string', example: 'imagen' },
              tamanoBytes: { type: 'number', example: 2048576 },
              extension: { type: 'string', example: '.jpg' },
              fechaCreacion: { type: 'string', format: 'date-time' },
              fechaModificacion: { type: 'string', format: 'date-time' },
            },
            required: ['nombre', 'rutaCompleta'],
          },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Files indexed successfully',
  })
  async indexFiles(@Body() body: IndexFilesDto) {
    try {
      if (!body.files || body.files.length === 0) {
        throw new HttpException('Files list is required', HttpStatus.BAD_REQUEST);
      }

      const files = body.files.map((f) => ({
        nombre: f.nombre,
        rutaCompleta: f.rutaCompleta,
        tipo: f.tipo,
        tamanoBytes: f.tamanoBytes,
        extension: f.extension,
        fechaCreacion: f.fechaCreacion ? new Date(f.fechaCreacion) : undefined,
        fechaModificacion: f.fechaModificacion ? new Date(f.fechaModificacion) : undefined,
      }));

      return await this.sdFilesService.indexFiles(body.userId || 'usuario_1', files);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to index files',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search files by name',
    description: 'Searches indexed files by filename.',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'query', required: true, type: String, example: 'vacaciones' })
  @ApiQuery({ name: 'tipo', required: false, type: String, example: 'imagen' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async searchFiles(
    @Query('userId') userId?: string,
    @Query('query') query?: string,
    @Query('tipo') tipo?: string,
  ) {
    try {
      if (!query) {
        throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
      }
      return await this.sdFilesService.searchFiles(userId || 'usuario_1', query, tipo);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search files',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list-by-type')
  @ApiOperation({
    summary: 'List files by type',
    description: 'Lists indexed files filtered by type (imagen, video, audio, documento).',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'tipo', required: true, type: String, example: 'imagen' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
  })
  async listByType(
    @Query('userId') userId?: string,
    @Query('tipo') tipo?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!tipo) {
        throw new HttpException('Tipo parameter is required', HttpStatus.BAD_REQUEST);
      }
      const limitNum = limit ? parseInt(limit, 10) : 50;
      return await this.sdFilesService.listFilesByType(userId || 'usuario_1', tipo, limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to list files',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get file statistics',
    description: 'Returns statistics about indexed files.',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Query('userId') userId?: string) {
    try {
      return await this.sdFilesService.getStatistics(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Clear file index',
    description: 'Removes all indexed files from the database.',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Index cleared successfully',
  })
  async clearIndex(@Query('userId') userId?: string) {
    try {
      return await this.sdFilesService.clearIndex(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to clear index',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
