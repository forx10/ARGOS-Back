import { IsArray, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBloqueoDto {
  @IsString()
  usuario_id: string;

  @IsArray()
  apps_bloqueadas: string[]; // ["Instagram", "TikTok", "YouTube"]

  @IsArray()
  sitios_bloqueados: string[]; // Patrones de URL

  @IsNumber()
  duracion_minutos: number; // Duración del bloqueo en minutos

  @IsString()
  @IsOptional()
  razon?: string; // "turno", "manual", etc
}
