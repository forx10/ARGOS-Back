import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LocationController],
  providers: [LocationService, PrismaService],
  exports: [LocationService],
})
export class LocationModule {}
