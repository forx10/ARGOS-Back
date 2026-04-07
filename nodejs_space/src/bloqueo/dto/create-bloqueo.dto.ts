import { IsArray, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum TriggerType {
  COMANDO_VOZ = 'comando_voz',
  CONTEXTO_ESTUDIO = 'contexto_estudio',
  TURNO_ROTATIVO = 'turno_rotativo',
  BLOQUEO_MANUAL = 'bloqueo_manual',
}

export class CreateBloqueoDto {
  @IsString()
  usuarioId: string;

  @IsArray()
  appsBloquear: string[]; // ["com.instagram.android", "com.tiktok.android", "com.google.android.youtube"]

  @IsArray()
  @IsOptional()
  sitiosBloquear: string[]; // ["pornhub.com", "xvideos.com"]

  @IsNumber()
  duracion: number; // Duración en segundos (3600 = 1 hora)

  @IsEnum(TriggerType)
  @IsOptional()
  trigger: TriggerType = TriggerType.BLOQUEO_MANUAL;

  @IsString()
  @IsOptional()
  appTrigger?: string; // Para contexto: "com.duolingo.android"

  @IsString()
  @IsOptional()
  razon?: string; // Descripción adicional

  @IsString()
  @IsOptional()
  comandoVoz?: string; // El comando que el usuario dijo
}
