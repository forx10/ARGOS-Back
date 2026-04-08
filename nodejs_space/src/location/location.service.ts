import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Process location data received from device
   */
  async saveLocation(userId: string, latitude: number, longitude: number) {
    try {
      this.logger.log(`Saving location for user ${userId}: ${latitude}, ${longitude}`);
      
      return {
        success: true,
        latitude,
        longitude,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to save location: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate navigation instructions to a destination
   */
  async getNavigation(destination: string, currentLat?: number, currentLng?: number) {
    try {
      this.logger.log(`Getting navigation to: ${destination}`);

      // Return Google Maps navigation intent data
      return {
        destination,
        currentLocation: currentLat && currentLng ? { lat: currentLat, lng: currentLng } : null,
        mapsUrl: this.generateGoogleMapsUrl(destination, currentLat, currentLng),
        intent: 'android.intent.action.VIEW',
        message: `Abriendo navegación a ${destination}`,
      };
    } catch (error) {
      this.logger.error(`Failed to get navigation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for a place and get its information
   */
  async searchPlace(query: string) {
    try {
      this.logger.log(`Searching for place: ${query}`);

      // Return search data for Google Maps
      return {
        query,
        mapsSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        intent: 'android.intent.action.VIEW',
        message: `Buscando ${query} en Google Maps`,
      };
    } catch (error) {
      this.logger.error(`Failed to search place: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get nearby places of a specific type
   */
  async getNearbyPlaces(type: string, currentLat: number, currentLng: number) {
    try {
      this.logger.log(`Getting nearby ${type} at ${currentLat}, ${currentLng}`);

      const typeNames: { [key: string]: string } = {
        restaurants: 'restaurantes',
        gas: 'gasolineras',
        hospital: 'hospitales',
        pharmacy: 'farmacias',
        atm: 'cajeros automáticos',
        parking: 'parqueaderos',
      };

      const typeName = typeNames[type] || type;

      return {
        type: typeName,
        currentLocation: { lat: currentLat, lng: currentLng },
        mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(type)}/@${currentLat},${currentLng},15z`,
        intent: 'android.intent.action.VIEW',
        message: `Buscando ${typeName} cercanos`,
      };
    } catch (error) {
      this.logger.error(`Failed to get nearby places: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate Google Maps URL
   */
  private generateGoogleMapsUrl(destination: string, lat?: number, lng?: number): string {
    if (lat && lng) {
      // Navigation from current location
      return `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    } else {
      // Navigation from device's current location (Google Maps will detect it)
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    }
  }
}
