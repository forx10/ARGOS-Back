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
import { AppBlockerModule } from './app-blocker/app-blocker.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SdFilesModule } from './sd-files/sd-files.module';
import { CameraModule } from './camera/camera.module';
import { SelfUpdateModule } from './self-update/self-update.module';
import { ScreenVisionModule } from './screen-vision/screen-vision.module';
import { EmergencyModule } from './emergency/emergency.module';
import { GeofencingModule } from './geofencing/geofencing.module';
import { FocusModeModule } from './focus-mode/focus-mode.module';
import { TasksModule } from './tasks/tasks.module';
import { DeviceDiagnosticsModule } from './device-diagnostics/device-diagnostics.module';
import { NetworkSecurityModule } from './network-security/network-security.module';
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
    AppBlockerModule,
    NotificationsModule,
    SdFilesModule,
    CameraModule,
    SelfUpdateModule,
    ScreenVisionModule,
    EmergencyModule,
    GeofencingModule,
    FocusModeModule,
    TasksModule,
    DeviceDiagnosticsModule,
    NetworkSecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
