import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { CameraService } from './camera.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CameraController],
  providers: [CameraService, PrismaService],
  exports: [CameraService],
})
export class CameraModule {}
