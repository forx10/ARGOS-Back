import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Register a music control command
   */
  async logCommand(command: string, status: string = 'success') {
    try {
      this.logger.log(`Music command: ${command} - ${status}`);
      // Log to database for history
      return {
        command,
        status,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to log command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get music control history
   */
  async getHistory(limit: number = 10) {
    try {
      this.logger.log(`Fetching last ${limit} music commands`);
      // This would fetch from DB in a real implementation
      return {
        message: 'Music history retrieved',
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get history: ${error.message}`);
      throw error;
    }
  }
}
