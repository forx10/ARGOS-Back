import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ComandoVozDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'usuario_1',
  })
  @IsString()
  usuarioId: string;

  @ApiProperty({
    description:
      'Texto del comando de voz. Ejemplos: "ARGOS bloquea Instagram por 2 horas", "ARGOS agregar alarma a las 4:15am para turno 1", "ARGOS hoy a las 3 voy a estudiar"',
    example: 'ARGOS bloquea Instagram por 2 horas',
  })
  @IsString()
  texto: string;

  @ApiProperty({
    description:
      'Audio del comando en base64 (opcional, si se usa reconocimiento de voz)',
    required: false,
  })
  @IsOptional()
  @IsString()
  audioBase64?: string;
}
