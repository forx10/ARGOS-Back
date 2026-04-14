import { Module } from '@nestjs/common';
import { PcBridgeController } from './pc-bridge.controller';
import { PcBridgeService } from './pc-bridge.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PcBridgeController],
  providers: [PcBridgeService, PrismaService],
  exports: [PcBridgeService],
})
export class PcBridgeModule {}
