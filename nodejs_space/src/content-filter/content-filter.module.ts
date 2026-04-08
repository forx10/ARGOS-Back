import { Module } from '@nestjs/common';
import { ContentFilterController } from './content-filter.controller';
import { ContentFilterService } from './content-filter.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ContentFilterController],
  providers: [ContentFilterService, PrismaService],
  exports: [ContentFilterService],
})
export class ContentFilterModule {}
