import { Module } from '@nestjs/common';
import { ScreenVisionController } from './screen-vision.controller';
import { ScreenVisionService } from './screen-vision.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ScreenVisionController],
  providers: [ScreenVisionService, PrismaService],
  exports: [ScreenVisionService],
})
export class ScreenVisionModule {}
