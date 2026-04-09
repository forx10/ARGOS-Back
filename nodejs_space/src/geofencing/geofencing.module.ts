import { Module } from '@nestjs/common';
import { GeofencingController } from './geofencing.controller';
import { GeofencingService } from './geofencing.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GeofencingController],
  providers: [GeofencingService, PrismaService],
  exports: [GeofencingService],
})
export class GeofencingModule {}