import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class SetupProfileDto {
  @ApiProperty({ example: 'usuario_1', description: 'ID del usuario' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ example: 'Luis', description: 'Tu nombre' })
  @IsString()
  nombreUsuario: string;

  @ApiPropertyOptional({ example: 'Jarvis', description: 'Cómo quieres llamar al asistente (por defecto: ARGOS)' })
  @IsOptional()
  @IsString()
  nombreAsistente?: string;

  @ApiPropertyOptional({ example: 'mujer', description: 'Género de voz: hombre o mujer', enum: ['hombre', 'mujer'] })
  @IsOptional()
  @IsIn(['hombre', 'mujer'])
  generoVoz?: string;

  @ApiPropertyOptional({ example: 'amigable', description: 'Personalidad del asistente', enum: ['profesional', 'amigable', 'formal'] })
  @IsOptional()
  @IsIn(['profesional', 'amigable', 'formal'])
  personalidad?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Friday', description: 'Nuevo nombre del asistente' })
  @IsOptional()
  @IsString()
  nombreAsistente?: string;

  @ApiPropertyOptional({ example: 'hombre', enum: ['hombre', 'mujer'] })
  @IsOptional()
  @IsIn(['hombre', 'mujer'])
  generoVoz?: string;

  @ApiPropertyOptional({ example: 'formal', enum: ['profesional', 'amigable', 'formal'] })
  @IsOptional()
  @IsIn(['profesional', 'amigable', 'formal'])
  personalidad?: string;

  @ApiPropertyOptional({ example: 'es', description: 'Idioma' })
  @IsOptional()
  @IsString()
  idioma?: string;
}
