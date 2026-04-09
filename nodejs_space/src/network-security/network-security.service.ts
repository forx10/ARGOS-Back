import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NetworkSecurityService {
  private readonly logger = new Logger(NetworkSecurityService.name);

  // Lista de sitios phishing conocidos (simplificada)
  private readonly SITIOS_PHISHING = [
    'paypal-verify.com',
    'verify-amazon.com',
    'google-login.net',
    'facebook-login.net',
    'secure-bank.xyz',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Analizar seguridad de una red WiFi
   */
  async analizarWifi(
    usuarioId: string,
    nombreWifi: string,
    nivelSeguridad: string, // WPA3, WPA2, WEP, Abierta
  ) {
    try {
      this.logger.log(
        `Analizando WiFi: ${nombreWifi} - Seguridad: ${nivelSeguridad}`,
      );

      let esSeguro = false;
      const recomendacion: string[] = [];

      switch (nivelSeguridad.toUpperCase()) {
        case 'WPA3':
          esSeguro = true;
          recomendacion.push('✅ WiFi seguro (WPA3 - más moderno)');
          break;
        case 'WPA2':
          esSeguro = true;
          recomendacion.push('✅ WiFi seguro (WPA2)');
          break;
        case 'WEP':
          esSeguro = false;
          recomendacion.push(
            '⚠️ WiFi inseguro (WEP es obsoleto)',
            '⚡ No envies datos sensibles en esta red',
            '🔐 Usa VPN si es necesario conectarse',
          );
          break;
        case 'ABIERTA':
          esSeguro = false;
          recomendacion.push(
            '🚨 WiFi SIN SEGURIDAD (red abierta)',
            '⚡ Tu tráfico es visible para otros',
            '🔐 USA VPN OBLIGATORIAMENTE en redes públicas',
          );
          break;
        default:
          esSeguro = false;
          recomendacion.push('Seguridad desconocida, procede con cuidado');
      }

      const registro = await this.prisma.monitor_red.create({
        data: {
          usuario_id: usuarioId,
          nombre_wifi: nombreWifi,
          seguridad_wifi: nivelSeguridad,
          es_seguro: esSeguro,
          recomendacion: recomendacion.join(' | '),
        },
      });

      return {
        success: true,
        wifiSeguro: esSeguro,
        nivelSeguridad,
        nombreWifi,
        recomendaciones: recomendacion,
        accion: !esSeguro ? 'Usa VPN' : 'Conexión segura',
      };
    } catch (error) {
      this.logger.error(`Error analizando WiFi: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detectar phishing en un sitio web
   */
  async detectarPhishing(usuarioId: string, sitio: string): Promise<{
    success: boolean;
    esPhishing: boolean;
    sitio: string;
    riesgo: string;
    recomendaciones: string[];
  }> {
    try {
      this.logger.log(`Analizando sitio para phishing: ${sitio}`);

      const esPhishing = this.SITIOS_PHISHING.some((p) =>
        sitio.toLowerCase().includes(p.toLowerCase()),
      );

      const recomendaciones: string[] = [];

      if (esPhishing) {
        recomendaciones.push(
          '🚨 ADVERTENCIA: Este sitio es CONOCIDO como phishing',
          '⚡ NO ingreses información personal',
          '🔐 Cierra el navegador de inmediato',
          '📝 Reporta el sitio a las autoridades',
        );
      } else {
        recomendaciones.push('✅ Sitio no es phishing conocido');
      }

      await this.prisma.monitor_red.create({
        data: {
          usuario_id: usuarioId,
          sitio_visitado: sitio,
          es_phishing: esPhishing,
          recomendacion: recomendaciones.join(' | '),
        },
      });

      return {
        success: true,
        esPhishing,
        sitio,
        riesgo: esPhishing ? 'MUY ALTO' : 'BAJO',
        recomendaciones,
      };
    } catch (error) {
      this.logger.error(`Error detectando phishing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Recomendación general de VPN
   */
  async obtenerRecomendacionVPN(usuarioId: string) {
    try {
      // Obtener últimos 5 registros de red
      const registros = await this.prisma.monitor_red.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { timestamp: 'desc' },
        take: 5,
      });

      const necesitaVPN =
        registros.some((r) => !r.es_seguro) ||
        registros.some((r) => r.es_phishing);

      return {
        success: true,
        necesitaVPN,
        mensaje: necesitaVPN
          ? '🔐 Te recomiendo usar una VPN para proteger tu privacidad'
          : '✅ Tu conexión es segura, pero usar VPN es siempre buena idea',
        beneficiosVPN: [
          '🔐 Encripta todo tu tráfico',
          '🇬🇬 Oculta tu ubicación real',
          '🚫 Bloquea rastreadores',
          '🌟 Acceso seguro en WiFi público',
        ],
      };
    } catch (error) {
      this.logger.error(`Error obteniendo recomendación VPN: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener historial de monitoreo
   */
  async obtenerHistorialMonitoreo(usuarioId: string) {
    try {
      const registros = await this.prisma.monitor_red.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      });

      const resumen = {
        total: registros.length,
        wifiInseguro: registros.filter((r) => r.nombre_wifi && !r.es_seguro)
          .length,
        sitiosPhishing: registros.filter((r) => r.es_phishing).length,
      };

      return {
        success: true,
        resumen,
        registros: registros.map((r) => ({
          fecha: r.timestamp,
          tipo: r.nombre_wifi ? 'WiFi' : 'Sitio Web',
          nombre: r.nombre_wifi || r.sitio_visitado,
          seguro: r.es_seguro ? 'Sí' : 'No',
          phishing: r.es_phishing ? 'Sí' : 'No',
        })),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo historial: ${error.message}`);
      throw error;
    }
  }
}