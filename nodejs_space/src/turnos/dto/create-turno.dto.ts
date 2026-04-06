import { IsString, IsDateString, Matches } from 'class-validator';

export class CreateTurnoDto {
  @IsString()
  usuario_id: string;

  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'hora_inicio debe ser en formato HH:MM' })
  hora_inicio: string;

  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'hora_fin debe ser en formato HH:MM' })
  hora_fin: string;

  @IsString()
  tipo_turno: string; // "6AM-2PM", "2PM-10PM", "10PM-6AM"

  @IsDateString()
  fecha: string; // Formato "YYYY-MM-DD"
}
