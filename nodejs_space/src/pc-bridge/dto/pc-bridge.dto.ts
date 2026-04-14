import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsInt, IsIn } from 'class-validator';

export class RegisterPcDto {
  @ApiProperty({ example: 'usuario_1' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ example: 'pc_trabajo_001', description: 'ID único del PC (generado por el cliente en PC)' })
  @IsString()
  pcId: string;

  @ApiProperty({ example: 'Mi PC Trabajo', description: 'Nombre amigable del PC' })
  @IsString()
  nombrePc: string;

  @ApiPropertyOptional({ example: 'Windows 11' })
  @IsOptional()
  @IsString()
  sistemaOperativo?: string;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsOptional()
  @IsString()
  ipLocal?: string;
}

export class AddSiteDto {
  @ApiProperty({ example: 'usuario_1' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ example: 'Gmail', description: 'Nombre del sitio' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'https://mail.google.com', description: 'URL completa' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'trabajo', description: 'Categoría', enum: ['trabajo', 'personal', 'entretenimiento', 'general'] })
  @IsOptional()
  @IsIn(['trabajo', 'personal', 'entretenimiento', 'general'])
  categoria?: string;

  @ApiPropertyOptional({ example: true, description: 'Abrir automáticamente al conectar PC' })
  @IsOptional()
  @IsBoolean()
  abrirAlInicio?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Orden de apertura' })
  @IsOptional()
  @IsInt()
  orden?: number;
}

export class AddMultipleSitesDto {
  @ApiProperty({ example: 'usuario_1' })
  @IsString()
  usuarioId: string;

  @ApiProperty({
    type: [AddSiteDto],
    example: [
      { nombre: 'Gmail', url: 'https://mail.google.com', categoria: 'trabajo' },
      { nombre: 'GitHub', url: 'https://github.com', categoria: 'trabajo' },
      { nombre: 'YouTube', url: 'https://youtube.com', categoria: 'entretenimiento' },
    ],
  })
  @IsArray()
  sitios: Omit<AddSiteDto, 'usuarioId'>[];
}

export class SendCommandDto {
  @ApiProperty({ example: 'usuario_1' })
  @IsString()
  usuarioId: string;

  @ApiProperty({ example: 'pc_trabajo_001' })
  @IsString()
  pcId: string;

  @ApiProperty({
    example: 'abrir_sitios',
    description: 'Tipo de comando a ejecutar en PC',
    enum: ['abrir_sitios', 'abrir_sitios_categoria', 'abrir_app', 'escribir', 'ejecutar', 'cerrar_todo'],
  })
  @IsString()
  tipoComando: string;

  @ApiPropertyOptional({
    example: { categoria: 'trabajo' },
    description: 'Parámetros del comando. Para abrir_sitios_categoria: {categoria: "trabajo"}. Para abrir_app: {app: "code"}. Para escribir: {texto: "Hola mundo"}',
  })
  @IsOptional()
  parametros?: Record<string, any>;
}

export class PcPingDto {
  @ApiProperty({ example: 'pc_trabajo_001' })
  @IsString()
  pcId: string;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsOptional()
  @IsString()
  ipLocal?: string;
}
