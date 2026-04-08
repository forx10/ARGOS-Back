import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsObject } from 'class-validator';

export class CrearAlarmaDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'usuario_1',
  })
  @IsString()
  usuarioId: string;

  @ApiProperty({
    description: 'Fecha y hora de la alarma (ISO 8601)',
    example: '2026-04-08T15:00:00Z',
  })
  @IsDateString()
  timestamp: Date;

  @ApiProperty({
    description: 'Tipo de alarma',
    enum: ['recordatorio', 'bloqueo', 'turno'],
    example: 'recordatorio',
  })
  @IsString()
  tipo: 'recordatorio' | 'bloqueo' | 'turno';

  @ApiProperty({
    description: 'Mensaje del recordatorio (solo para tipo recordatorio)',
    required: false,
    example: 'Hora de estudiar',
  })
  @IsOptional()
  @IsString()
  mensaje?: string;

  @ApiProperty({
    description: 'Metadata adicional (apps, sitios, turno_id, etc.)',
    required: false,
    example: {
      apps: ['com.instagram.android'],
      duracion: 7200,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
