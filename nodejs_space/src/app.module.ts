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
import { MusicModule } from './music/music.module';
import { ContentFilterModule } from './content-filter/content-filter.module';
import { LocationModule } from './location/location.module';
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
    MusicModule,
    ContentFilterModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
