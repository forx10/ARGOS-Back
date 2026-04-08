import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);
  private readonly apiKey: string;
  private readonly apiEndpoint = 'https://apps.abacus.ai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACUSAI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.error('ABACUSAI_API_KEY not found in environment');
    }
  }

  /**
   * Search the web for information
   */
  async searchWeb(query: string): Promise<string> {
    try {
      this.logger.log(`Searching web for: ${query}`);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Search the web and provide current, accurate information about: ${query}. Be concise but informative.`,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'No response from AI';
      
      this.logger.log(`Web search completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Web search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Answer a question using AI intelligence
   */
  async answerQuestion(question: string, useWebSearch: boolean = false): Promise<string> {
    try {
      this.logger.log(`Answering question: ${question} (web search: ${useWebSearch})`);

      let prompt = question;
      if (useWebSearch) {
        prompt = `Search the web if needed and answer this question accurately: ${question}. Provide a clear, concise answer.`;
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are ARGOS, a sophisticated AI assistant. Be concise, accurate, and helpful. Respond in Spanish when the user speaks Spanish.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'No response from AI';
      
      this.logger.log(`Question answered successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Answer generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Have a conversation with context
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      this.logger.log(`Processing chat with ${messages.length} messages`);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are ARGOS, a sophisticated AI assistant with personality. Be helpful, slightly sarcastic when appropriate, and always accurate. Respond in Spanish when the user speaks Spanish.',
            },
            ...messages,
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`API error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'No response from AI';
      
      this.logger.log(`Chat processed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Chat processing failed: ${error.message}`);
      throw error;
    }
  }
}
