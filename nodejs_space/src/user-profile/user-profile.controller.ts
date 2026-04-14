import { Controller, Post, Get, Put, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { SetupProfileDto, UpdateProfileDto } from './dto/setup-profile.dto';

@ApiTags('🎭 Perfil de Usuario (Personalización)')
@Controller('api/v1/profile')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(private readonly profileService: UserProfileService) {}

  @Post('setup')
  @ApiOperation({
    summary: 'Configuración inicial del asistente',
    description: 'Primer paso: ARGOS pregunta tu nombre y cómo quieres llamarlo. Ejemplo: "Me llamo Luis y quiero que te llames Jarvis"',
  })
  @ApiResponse({ status: 201, description: 'Perfil configurado exitosamente. Retorna configuración para Tasker.' })
  async setupProfile(@Body() dto: SetupProfileDto) {
    this.logger.log(`POST /api/v1/profile/setup - Configurando perfil para ${dto.usuarioId}`);
    return this.profileService.setupProfile(dto);
  }

  @Get(':usuarioId')
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Devuelve el perfil completo incluyendo nombre del asistente, voz y saludo personalizado',
  })
  async getProfile(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/v1/profile/${usuarioId}`);
    return this.profileService.getProfile(usuarioId);
  }

  @Put(':usuarioId')
  @ApiOperation({
    summary: 'Actualizar preferencias',
    description: 'Cambia nombre del asistente, voz, personalidad. Ej: "Ahora quiero que te llames Friday y seas mujer"',
  })
  async updateProfile(@Param('usuarioId') usuarioId: string, @Body() dto: UpdateProfileDto) {
    this.logger.log(`PUT /api/v1/profile/${usuarioId}`);
    return this.profileService.updateProfile(usuarioId, dto);
  }

  @Get(':usuarioId/tasker-config')
  @ApiOperation({
    summary: 'Obtener configuración para Tasker',
    description: 'Retorna wake word, género de voz y otros valores que Tasker necesita para funcionar',
  })
  async getTaskerConfig(@Param('usuarioId') usuarioId: string) {
    this.logger.log(`GET /api/v1/profile/${usuarioId}/tasker-config`);
    return this.profileService.getTaskerConfig(usuarioId);
  }
}
