import { Module } from '@nestjs/common';
import { ComandoVozController } from './comando-voz.controller';
import { ComandoVozService } from './comando-voz.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmService } from '../alarmas/alarm.service';
import { BloqueoService } from '../bloqueo/bloqueo.service';
import { TurnosService } from '../turnos/turnos.service';

@Module({
  controllers: [ComandoVozController],
  providers: [
    ComandoVozService,
    PrismaService,
    AlarmService,
    BloqueoService,
    TurnosService,
  ],
})
export class ComandoVozModule {}
