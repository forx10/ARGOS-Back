import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AlarmController],
  providers: [AlarmService, PrismaService],
  exports: [AlarmService],
})
export class AlarmModule {}
