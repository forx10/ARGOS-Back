import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ComandoVozDto {
  @ApiProperty({ example: 'usuario_1', description: 'ID del usuario' })
  @IsString()
  usuarioId: string;

  @ApiProperty({
    example: 'bloquea Instagram por 2 horas',
    description: 'Texto del comando de voz (ya convertido de voz a texto por AutoVoice)',
  })
  @IsString()
  texto: string;

  @ApiPropertyOptional({ description: 'Audio en base64 (opcional)' })
  @IsOptional()
  @IsString()
  audioBase64?: string;
}

export class ComandoUnificadoDto {
  @ApiProperty({ example: 'usuario_1' })
  @IsString()
  usuarioId: string;

  @ApiProperty({
    example: 'Jarvis bloquea Instagram por 2 horas',
    description: 'Comando completo de voz incluyendo wake word',
  })
  @IsString()
  comando: string;

  @ApiPropertyOptional({ example: 'pc_luis_001', description: 'ID de la PC si hay una conectada' })
  @IsOptional()
  @IsString()
  pcId?: string;
}
