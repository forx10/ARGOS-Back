import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { TurnosModule } from './turnos/turnos.module';
import { BloqueoModule } from './bloqueo/bloqueo.module';
import { WebhookModule } from './webhook/webhook.module';
import { EstadoModule } from './estado/estado.module';
import { ComandoVozModule } from './comando-voz/comando-voz.module';
import { AlarmModule } from './alarmas/alarm.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TurnosModule,
    BloqueoModule,
    WebhookModule,
    EstadoModule,
    ComandoVozModule,
    AlarmModule,
    IntelligenceModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
