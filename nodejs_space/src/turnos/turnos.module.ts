import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TurnosService, PrismaService],
  controllers: [TurnosController],
})
export class TurnosModule {}
