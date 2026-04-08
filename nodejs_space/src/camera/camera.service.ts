import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PhotoData {
  rutaArchivo: string;
  rutaCloud?: string;
  descripcion?: string;
  camara: 'frontal' | 'trasera';
  resolucion?: string;
}

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Register photo taken by camera
   */
  async registerPhoto(userId: string, photoData: PhotoData) {
    try {
      this.logger.log(
        `Registering photo from ${photoData.camara} camera for user: ${userId}`,
      );

      const photo = await this.prisma.foto_camara.create({
        data: {
          usuario_id: userId,
          ruta_archivo: photoData.rutaArchivo,
          ruta_cloud: photoData.rutaCloud,
          descripcion: photoData.descripcion,
          camara: photoData.camara,
          resolucion: photoData.resolucion,
        },
      });

      return {
        success: true,
        message: 'Foto registrada correctamente',
        photo: {
          id: photo.id,
          ruta: photo.ruta_archivo,
          camara: photo.camara,
          timestamp: photo.timestamp,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to register photo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recent photos
   */
  async getRecentPhotos(userId: string, limit: number = 20) {
    try {
      const photos = await this.prisma.foto_camara.findMany({
        where: { usuario_id: userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return {
        count: photos.length,
        photos: photos.map((p) => ({
          id: p.id,
          ruta: p.ruta_archivo,
          rutaCloud: p.ruta_cloud,
          descripcion: p.descripcion,
          camara: p.camara,
          resolucion: p.resolucion,
          timestamp: p.timestamp,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get recent photos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete photo record
   */
  async deletePhoto(photoId: number) {
    try {
      await this.prisma.foto_camara.delete({
        where: { id: photoId },
      });

      return {
        success: true,
        message: 'Foto eliminada',
      };
    } catch (error) {
      this.logger.error(`Failed to delete photo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get photo statistics
   */
  async getStatistics(userId: string) {
    try {
      const total = await this.prisma.foto_camara.count({
        where: { usuario_id: userId },
      });

      const byCamera = await this.prisma.foto_camara.groupBy({
        by: ['camara'],
        where: { usuario_id: userId },
        _count: true,
      });

      return {
        total,
        byCamera: byCamera.map((c) => ({
          camara: c.camara,
          count: c._count,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      throw error;
    }
  }
}
