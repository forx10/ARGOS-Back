import { Controller, Post, Get, Delete, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CameraService } from './camera.service';

class RegisterPhotoDto {
  userId?: string;
  rutaArchivo: string;
  rutaCloud?: string;
  descripcion?: string;
  camara: 'frontal' | 'trasera';
  resolucion?: string;
}

@ApiTags('Camera')
@Controller('api/v1/camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Post('register-photo')
  @ApiOperation({
    summary: 'Register photo taken',
    description: 'Registers a photo taken by the device camera.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        rutaArchivo: { type: 'string', example: '/sdcard/DCIM/Camera/IMG_20260408_140530.jpg' },
        rutaCloud: { type: 'string', example: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fHww' },
        descripcion: { type: 'string', example: 'Foto del paisaje' },
        camara: { type: 'string', enum: ['frontal', 'trasera'], example: 'trasera' },
        resolucion: { type: 'string', example: '4000x3000' },
      },
      required: ['rutaArchivo', 'camara'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Photo registered successfully',
  })
  async registerPhoto(@Body() body: RegisterPhotoDto) {
    try {
      return await this.cameraService.registerPhoto(body.userId || 'usuario_1', {
        rutaArchivo: body.rutaArchivo,
        rutaCloud: body.rutaCloud,
        descripcion: body.descripcion,
        camara: body.camara,
        resolucion: body.resolucion,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to register photo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recent-photos')
  @ApiOperation({
    summary: 'Get recent photos',
    description: 'Retrieves recently taken photos.',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Photos retrieved successfully',
  })
  async getRecentPhotos(@Query('userId') userId?: string, @Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
      }
      return await this.cameraService.getRecentPhotos(userId || 'usuario_1', limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get recent photos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete photo record',
    description: 'Deletes a photo record from the database.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Photo ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Photo deleted successfully',
  })
  async deletePhoto(@Param('id') id: string) {
    try {
      const photoId = parseInt(id, 10);
      if (isNaN(photoId)) {
        throw new HttpException('Invalid photo ID', HttpStatus.BAD_REQUEST);
      }
      return await this.cameraService.deletePhoto(photoId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete photo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get photo statistics',
    description: 'Returns statistics about taken photos.',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Query('userId') userId?: string) {
    try {
      return await this.cameraService.getStatistics(userId || 'usuario_1');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
