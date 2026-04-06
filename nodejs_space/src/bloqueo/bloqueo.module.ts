import { Module } from '@nestjs/common';
import { BloqueoService } from './bloqueo.service';
import { BloqueoController } from './bloqueo.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [BloqueoService, PrismaService],
  controllers: [BloqueoController],
})
export class BloqueoModule {}
