import { Module } from '@nestjs/common';
import { NetworkSecurityController } from './network-security.controller';
import { NetworkSecurityService } from './network-security.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NetworkSecurityController],
  providers: [NetworkSecurityService, PrismaService],
  exports: [NetworkSecurityService],
})
export class NetworkSecurityModule {}