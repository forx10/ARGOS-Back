import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';

class SearchWebDto {
  query: string;
}

class AnswerQuestionDto {
  question: string;
  useWebSearch?: boolean;
}

class ChatDto {
  messages: Array<{ role: string; content: string }>;
}

@ApiTags('Intelligence')
@Controller('api/v1/intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post('search')
  @ApiOperation({ 
    summary: 'Search the web for information',
    description: 'Uses AI to search the web and return relevant information about a query'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          example: '¿Cuál es el clima en Bogotá hoy?',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results returned successfully',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        result: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchWeb(@Body() body: SearchWebDto) {
    try {
      if (!body.query || body.query.trim() === '') {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.intelligenceService.searchWeb(body.query);
      return {
        query: body.query,
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to search web',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('answer')
  @ApiOperation({ 
    summary: 'Answer a question using AI',
    description: 'Uses AI to answer questions. Can optionally use web search for current information.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { 
          type: 'string', 
          example: '¿Qué es la fotosíntesis?',
          description: 'The question to answer'
        },
        useWebSearch: {
          type: 'boolean',
          example: false,
          description: 'Whether to use web search for current information',
          default: false
        }
      },
      required: ['question']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Answer generated successfully',
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        answer: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async answerQuestion(@Body() body: AnswerQuestionDto) {
    try {
      if (!body.question || body.question.trim() === '') {
        throw new HttpException('Question is required', HttpStatus.BAD_REQUEST);
      }

      const answer = await this.intelligenceService.answerQuestion(
        body.question,
        body.useWebSearch || false,
      );
      
      return {
        question: body.question,
        answer,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to answer question',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat')
  @ApiOperation({ 
    summary: 'Have a conversation with ARGOS',
    description: 'Send messages and maintain conversation context with the AI'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { 
                type: 'string', 
                enum: ['user', 'assistant'],
                description: 'Message role'
              },
              content: { 
                type: 'string',
                description: 'Message content'
              }
            },
            required: ['role', 'content']
          },
          example: [
            { role: 'user', content: 'Hola ARGOS' },
            { role: 'assistant', content: 'Hola, ¿en qué puedo ayudarte?' },
            { role: 'user', content: '¿Qué hora es?' }
          ]
        }
      },
      required: ['messages']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat response generated successfully',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async chat(@Body() body: ChatDto) {
    try {
      if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        throw new HttpException('Messages array is required', HttpStatus.BAD_REQUEST);
      }

      const response = await this.intelligenceService.chat(body.messages);
      return {
        response,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process chat',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
