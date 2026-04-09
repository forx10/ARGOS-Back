import { Module } from '@nestjs/common';
import { DeviceDiagnosticsController } from './device-diagnostics.controller';
import { DeviceDiagnosticsService } from './device-diagnostics.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DeviceDiagnosticsController],
  providers: [DeviceDiagnosticsService, PrismaService],
  exports: [DeviceDiagnosticsService],
})
export class DeviceDiagnosticsModule {}