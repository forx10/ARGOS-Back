import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service';

class SaveLocationDto {
  userId: string;
  latitude: number;
  longitude: number;
}

class NavigationDto {
  destination: string;
  currentLat?: number;
  currentLng?: number;
}

@ApiTags('Location & Navigation')
@Controller('api/v1/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('save')
  @ApiOperation({
    summary: 'Save current location',
    description: 'Saves the current GPS location from the device',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'usuario_1' },
        latitude: { type: 'number', example: 4.7110 },
        longitude: { type: 'number', example: -74.0721 },
      },
      required: ['userId', 'latitude', 'longitude'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Location saved successfully',
  })
  async saveLocation(@Body() body: SaveLocationDto) {
    try {
      if (!body.userId || body.latitude === undefined || body.longitude === undefined) {
        throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
      }

      return await this.locationService.saveLocation(body.userId, body.latitude, body.longitude);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to save location',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('navigate')
  @ApiOperation({
    summary: 'Get navigation to destination',
    description: 'Generates Google Maps navigation URL to the specified destination',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        destination: { type: 'string', example: 'Centro Comercial Andino, Bogotá' },
        currentLat: { type: 'number', example: 4.7110 },
        currentLng: { type: 'number', example: -74.0721 },
      },
      required: ['destination'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Navigation data generated successfully',
    schema: {
      type: 'object',
      properties: {
        destination: { type: 'string' },
        currentLocation: { type: 'object' },
        mapsUrl: { type: 'string' },
        intent: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async navigate(@Body() body: NavigationDto) {
    try {
      if (!body.destination || body.destination.trim() === '') {
        throw new HttpException('Destination is required', HttpStatus.BAD_REQUEST);
      }

      return await this.locationService.getNavigation(
        body.destination,
        body.currentLat,
        body.currentLng,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get navigation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for a place',
    description: 'Searches for a place in Google Maps',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    description: 'Search query (place name, address, etc.)',
    example: 'Restaurantes italianos en Bogotá',
  })
  @ApiResponse({
    status: 200,
    description: 'Search data generated successfully',
  })
  async searchPlace(@Query('query') query: string) {
    try {
      if (!query || query.trim() === '') {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }

      return await this.locationService.searchPlace(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search place',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find nearby places',
    description: 'Finds nearby places of a specific type (restaurants, gas stations, etc.)',
  })
  @ApiQuery({
    name: 'type',
    type: String,
    description: 'Type of place to search',
    example: 'restaurants',
  })
  @ApiQuery({
    name: 'lat',
    type: Number,
    description: 'Current latitude',
    example: 4.7110,
  })
  @ApiQuery({
    name: 'lng',
    type: Number,
    description: 'Current longitude',
    example: -74.0721,
  })
  @ApiResponse({
    status: 200,
    description: 'Nearby places search generated successfully',
  })
  async getNearbyPlaces(
    @Query('type') type: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    try {
      if (!type || !lat || !lng) {
        throw new HttpException('Type, lat, and lng are required', HttpStatus.BAD_REQUEST);
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new HttpException('Invalid coordinates', HttpStatus.BAD_REQUEST);
      }

      return await this.locationService.getNearbyPlaces(type, latitude, longitude);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get nearby places',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
