import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateRequest {
  commandType: string;
  commandDescription: string;
  reason: string;
  userId?: string;
}

export interface UpdateOption {
  type: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedTime: string;
  requiredPermissions: string[];
}

@Injectable()
export class SelfUpdateService {
  private readonly logger = new Logger(SelfUpdateService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze if ARGOS can perform a task, if not suggest updates
   */
  async analyzeCommand(data: UpdateRequest) {
    try {
      this.logger.log(`Analyzing command: ${data.commandType} - ${data.commandDescription}`);

      // Check if command is already available
      const isAvailable = this.checkCommandAvailability(data.commandType);

      if (isAvailable) {
        return {
          success: true,
          canExecute: true,
          message: 'ARGOS ya puede realizar esta tarea',
          commandType: data.commandType,
        };
      }

      // Get suggested updates
      const updateOptions = this.getUpdateOptions(data.commandType, data.commandDescription);

      // Store update request in database
      const request = await this.prisma.solicitud_actualizacion.create({
        data: {
          usuario_id: data.userId || 'usuario_1',
          tipo_comando: data.commandType,
          descripcion: data.commandDescription,
          razon: data.reason,
          estado: 'pendiente',
        },
      });

      return {
        success: true,
        canExecute: false,
        message: 'ARGOS no puede realizar esta tarea aún, pero puedo actualizarme',
        commandType: data.commandType,
        description: data.commandDescription,
        updateRequestId: request.id,
        updateOptions,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if command is available
   */
  private checkCommandAvailability(commandType: string): boolean {
    const availableCommands = [
      'bloqueo_apps',
      'bloqueo_sitios',
      'reproducir_musica',
      'pausar_musica',
      'siguiente_cancion',
      'volumen',
      'crear_alarma',
      'buscar_web',
      'responder_pregunta',
      'navegacion_gps',
      'notificacion_voz',
      'buscar_archivos',
      'tomar_foto',
      'control_pantalla',
    ];

    return availableCommands.includes(commandType.toLowerCase());
  }

  /**
   * Get update options for a command type
   */
  private getUpdateOptions(commandType: string, description: string): UpdateOption[] {
    const optionsMap: { [key: string]: UpdateOption[] } = {
      lectura_documentos: [
        {
          type: 'ocr_vision',
          description: 'Agregar capacidad de lectura de documentos con OCR',
          pros: [
            'Puedo leer textos de documentos, facturas, recibos',
            'Ayuda con impuestos y documentación',
            'Funciona en tiempo real',
          ],
          cons: [
            'Requiere más procesamiento (+2s por lectura)',
            'Mejor con documentos de alta calidad',
            'Usa créditos de visión por IA',
          ],
          estimatedTime: '2 horas',
          requiredPermissions: ['permiso_camara', 'permiso_almacenamiento'],
        },
      ],
      analisis_email: [
        {
          type: 'email_integration',
          description: 'Integración con Gmail para leer y responder emails',
          pros: [
            'Puedo leer tus emails por voz',
            'Responder automáticamente',
            'Filtrar por remitente o asunto',
          ],
          cons: [
            'Requiere OAuth de Google',
            'Acceso a cuenta Gmail',
            'Latencia de 1-2 segundos',
          ],
          estimatedTime: '3 horas',
          requiredPermissions: ['permiso_internet', 'oauth_google'],
        },
      ],
      control_hogar: [
        {
          type: 'smart_home_iot',
          description: 'Integración con dispositivos smart home (luces, termostato)',
          pros: [
            'Controlar luces, temperature, puertas',
            'Automatización de escenas',
            'Control por voz',
          ],
          cons: [
            'Requiere red local o conexión a nube',
            'Compatible solo con ciertos dispositivos',
            'Configuración inicial compleja',
          ],
          estimatedTime: '4 horas',
          requiredPermissions: ['permiso_wifi', 'permiso_red'],
        },
      ],
      control_calendario: [
        {
          type: 'calendar_sync',
          description: 'Sincronización con Google Calendar',
          pros: [
            'Ver próximos eventos por voz',
            'Crear eventos automáticamente',
            'Recordatorios inteligentes',
          ],
          cons: [
            'Requiere cuenta Google',
            'Latencia de 1-2 segundos',
            'Sincronización puede ser lenta',
          ],
          estimatedTime: '2 horas',
          requiredPermissions: ['oauth_google', 'permiso_calendario'],
        },
      ],
    };

    // Return generic options if command type not in map
    return optionsMap[commandType] || this.getDefaultUpdateOption(description);
  }

  /**
   * Get default update option for unknown command types
   */
  private getDefaultUpdateOption(description: string): UpdateOption[] {
    return [
      {
        type: 'custom_endpoint',
        description: `Agregar nuevo endpoint para: ${description}`,
        pros: [
          'Personalizado para tu caso de uso',
          'Optimizado para tu dispositivo',
          'Integración perfecta con ARGOS',
        ],
        cons: [
          'Requiere análisis de requisitos',
          'Tiempo de desarrollo variable',
          'Posibles dependencias externas',
        ],
        estimatedTime: '2-4 horas',
        requiredPermissions: ['conexion_backend'],
      },
    ];
  }

  /**
   * Approve update
   */
  async approveUpdate(userId: string, requestId: number, selectedOption: string) {
    try {
      this.logger.log(`Approving update ${requestId} with option: ${selectedOption}`);

      // Update request status
      const request = await this.prisma.solicitud_actualizacion.update({
        where: { id: requestId },
        data: {
          estado: 'aprobado',
          opcion_seleccionada: selectedOption,
        },
      });

      return {
        success: true,
        message: 'Actualización aprobada',
        requestId: request.id,
        nextSteps: [
          '1. ARGOS comenzará la descarga de componentes necesarios',
          '2. Se instalará en segundo plano',
          '3. Te notificaré cuando esté lista',
          '4. Podrás usar la nueva función inmediatamente',
        ],
        estimatedDuration: 'Depende del módulo (2-4 horas)',
      };
    } catch (error) {
      this.logger.error(`Failed to approve update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reject update
   */
  async rejectUpdate(userId: string, requestId: number, reason?: string) {
    try {
      this.logger.log(`Rejecting update ${requestId}`);

      await this.prisma.solicitud_actualizacion.update({
        where: { id: requestId },
        data: {
          estado: 'rechazado',
          notas: reason,
        },
      });

      return {
        success: true,
        message: 'Actualización rechazada',
      };
    } catch (error) {
      this.logger.error(`Failed to reject update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get update history
   */
  async getUpdateHistory(userId: string) {
    try {
      const updates = await this.prisma.solicitud_actualizacion.findMany({
        where: { usuario_id: userId },
        orderBy: { creado_en: 'desc' },
        take: 50,
      });

      return {
        count: updates.length,
        updates: updates.map((u) => ({
          id: u.id,
          tipo: u.tipo_comando,
          descripcion: u.descripcion,
          estado: u.estado,
          creado: u.creado_en,
          opcionSeleccionada: u.opcion_seleccionada,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get update history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current version and installed features
   */
  async getSystemInfo() {
    try {
      return {
        version: '2.1.0',
        buildDate: '2026-04-08',
        features: [
          'Bloqueos Innegables',
          'Control de Música',
          'Alarmas',
          'Inteligencia IA',
          'Navegación GPS',
          'Notificaciones de Voz',
          'Archivos SD',
          'Control de Cámara',
          'Visión de Pantalla',
          'Auto-actualización',
        ],
        lastUpdate: '2026-04-08T14:30:00Z',
        status: 'operative',
      };
    } catch (error) {
      this.logger.error(`Failed to get system info: ${error.message}`);
      throw error;
    }
  }
}
