import { Module } from '@nestjs/common';
import { AppBlockerController } from './app-blocker.controller';
import { AppBlockerService } from './app-blocker.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AppBlockerController],
  providers: [AppBlockerService, PrismaService],
  exports: [AppBlockerService],
})
export class AppBlockerModule {}
