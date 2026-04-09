import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceDiagnosticsService {
  private readonly logger = new Logger(DeviceDiagnosticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar diagnóstico del dispositivo
   */
  async registrarDiagnostico(
    usuarioId: string,
    ramTotalMb?: number,
    ramDisponibleMb?: number,
    cpuPorcentaje?: number,
    temperatura?: number,
    bateriaPorcent?: number,
    almacenamientoLibreMb?: bigint,
  ) {
    try {
      this.logger.log(`Registrando diagnóstico para ${usuarioId}`);

      // Detectar problemas
      const problemas: string[] = [];
      const recomendaciones: string[] = [];

      if (ramDisponibleMb && ramDisponibleMb < 500) {
        problemas.push('RAM baja (< 500MB)');
        recomendaciones.push('⚡ Cierra apps en background para liberar RAM');
      }

      if (cpuPorcentaje && cpuPorcentaje > 80) {
        problemas.push('CPU alta (> 80%)');
        recomendaciones.push('⚡ Hay procesos usando mucha CPU, reinicia el dispositivo');
      }

      if (temperatura && temperatura > 40) {
        problemas.push(`Temperatura alta (${temperatura}°C)`);
        recomendaciones.push('❄️ El dispositivo está caliente, déjalo enfriar');
      }

      if (bateriaPorcent && bateriaPorcent < 20) {
        problemas.push('Batería baja');
        recomendaciones.push('🔋 Carga tu dispositivo pronto');
      }

      if (almacenamientoLibreMb && almacenamientoLibreMb < 1000) {
        problemas.push('Almacenamiento casi lleno');
        recomendaciones.push('🗑️ Elimina archivos o apps que no uses');
      }

      const diagnostico = await this.prisma.diagnostico_dispositivo.create({
        data: {
          usuario_id: usuarioId,
          ram_total_mb: ramTotalMb,
          ram_disponible_mb: ramDisponibleMb,
          cpu_porcentaje: cpuPorcentaje,
          temperatura,
          bateria_porcent: bateriaPorcent,
          almacenamiento_libre_mb: almacenamientoLibreMb,
          problemas,
          recomendaciones,
        },
      });

      return {
        success: true,
        timestamp: diagnostico.timestamp,
        estado:
          problemas.length === 0
            ? '✅ Dispositivo en buen estado'
            : '⚠️ Se detectaron problemas',
        problemas,
        recomendaciones,
        detalles: {
          ram: `${ramDisponibleMb}MB disponible de ${ramTotalMb}MB`,
          cpu: `${cpuPorcentaje}%`,
          temperatura: `${temperatura}°C`,
          bateria: `${bateriaPorcent}%`,
          almacenamiento: `${almacenamientoLibreMb}MB libres`,
        },
      };
    } catch (error) {
      this.logger.error(`Error registrando diagnóstico: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener diagnóstico más reciente
   */
  async obtenerUltimoDiagnostico(usuarioId: string) {
    try {
      const diagnostico = await this.prisma.diagnostico_dispositivo.findFirst({
        where: { usuario_id: usuarioId },
        orderBy: { timestamp: 'desc' },
      });

      if (!diagnostico) {
        return {
          success: true,
          diagnostico: null,
          message: 'No hay diagnósticos registrados aún',
        };
      }

      return {
        success: true,
        diagnostico: {
          timestamp: diagnostico.timestamp,
          ram: `${diagnostico.ram_disponible_mb}MB / ${diagnostico.ram_total_mb}MB`,
          cpu: `${diagnostico.cpu_porcentaje}%`,
          temperatura: `${diagnostico.temperatura}°C`,
          bateria: `${diagnostico.bateria_porcent}%`,
          almacenamiento: `${diagnostico.almacenamiento_libre_mb}MB libres`,
          problemas: diagnostico.problemas,
          recomendaciones: diagnostico.recomendaciones,
        },
      };
    } catch (error) {
      this.logger.error(`Error obteniendo diagnóstico: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener historial de diagnósticos
   */
  async obtenerHistorial(usuarioId: string, limite: number = 10) {
    try {
      const diagnosticos = await this.prisma.diagnostico_dispositivo.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { timestamp: 'desc' },
        take: limite,
      });

      return {
        success: true,
        total: diagnosticos.length,
        diagnosticos: diagnosticos.map((d) => ({
          fecha: d.timestamp,
          ram: d.ram_disponible_mb,
          cpu: d.cpu_porcentaje,
          temperatura: d.temperatura,
          bateria: d.bateria_porcent,
          problemas: d.problemas.length,
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo historial: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener recomendaciones de optimización
   */
  async obtenerRecomendacionesOptimizacion(usuarioId: string): Promise<string[]> {
    try {
      const ultimoDiag = await this.prisma.diagnostico_dispositivo.findFirst({
        where: { usuario_id: usuarioId },
        orderBy: { timestamp: 'desc' },
      });

      if (!ultimoDiag) {
        return ['📊 Ejecuta un diagnóstico primero para obtener recomendaciones'];
      }

      const recomendaciones: string[] = [];

      // RAM
      if (ultimoDiag.ram_disponible_mb && ultimoDiag.ram_disponible_mb < 1000) {
        recomendaciones.push(
          '⚡ Limpia RAM: cierra apps en background y reinicia el dispositivo',
        );
      }

      // CPU
      if (ultimoDiag.cpu_porcentaje && ultimoDiag.cpu_porcentaje > 70) {
        recomendaciones.push('🔧 Desinstala apps que consuman mucho CPU');
      }

      // Almacenamiento
      if (ultimoDiag.almacenamiento_libre_mb && ultimoDiag.almacenamiento_libre_mb < 2000) {
        recomendaciones.push('🗑️ Elimina fotos/videos antiguos o usa nube');
      }

      // Batería
      if (ultimoDiag.bateria_porcent && ultimoDiag.bateria_porcent < 30) {
        recomendaciones.push('🔋 Activa modo ahorro de batería');
      }

      if (recomendaciones.length === 0) {
        recomendaciones.push('✅ Tu dispositivo está optimizado. ¡Sigue así!');
      }

      return recomendaciones;
    } catch (error) {
      this.logger.error(
        `Error obteniendo recomendaciones: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Simular limpieza de caché
   */
  async limpiarCache(usuarioId: string) {
    try {
      this.logger.log(`Limpiando caché para ${usuarioId}`);

      // En producción, esto llamaría a comandos del dispositivo
      return {
        success: true,
        message: '🧹 Caché limpiado exitosamente',
        detalles: [
          '✓ Caché del sistema limpiado',
          '✓ Caché de apps limpiado',
          '✓ Archivos temporales eliminados',
        ],
      };
    } catch (error) {
      this.logger.error(`Error limpiando caché: ${error.message}`);
      throw error;
    }
  }
}