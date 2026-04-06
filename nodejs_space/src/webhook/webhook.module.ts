import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [WebhookService, PrismaService],
  controllers: [WebhookController],
})
export class WebhookModule {}
