import { Module } from '@nestjs/common';
import { FocusModeController } from './focus-mode.controller';
import { FocusModeService } from './focus-mode.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FocusModeController],
  providers: [FocusModeService, PrismaService],
  exports: [FocusModeService],
})
export class FocusModeModule {}