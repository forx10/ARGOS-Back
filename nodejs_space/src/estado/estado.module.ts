import { Module } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { EstadoController } from './estado.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [EstadoService, PrismaService],
  controllers: [EstadoController],
})
export class EstadoModule {}
