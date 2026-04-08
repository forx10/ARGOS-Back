import { Module } from '@nestjs/common';
import { SdFilesController } from './sd-files.controller';
import { SdFilesService } from './sd-files.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SdFilesController],
  providers: [SdFilesService, PrismaService],
  exports: [SdFilesService],
})
export class SdFilesModule {}
