import { Module } from '@nestjs/common';
import { SelfUpdateController } from './self-update.controller';
import { SelfUpdateService } from './self-update.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SelfUpdateController],
  providers: [SelfUpdateService, PrismaService],
  exports: [SelfUpdateService],
})
export class SelfUpdateModule {}
