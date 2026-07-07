import {
  type GenerateContentConfig,
  GoogleGenAI,
  type Schema,
} from '@google/genai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '@/libs/configs';
import {
  type LLMProvider,
  type LLMSendOptions,
} from '@/modules/rag/application/interfaces/llm-provider.interface';

@Injectable()
export class GeminiAdapter implements LLMProvider {
  private readonly genAI: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get<string>(Env.GEMINI_API_KEY),
    });
  }

  async sendMessage(
    content: string,
    schema?: Schema,
    options?: LLMSendOptions,
  ): Promise<string> {
    try {
      this.logger.log('[GeminiAdapter]: START');
      const startTime = Date.now();

      const config: GenerateContentConfig = {};
      if (schema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = schema;
      }
      if (options?.thinkingConfig) {
        config.thinkingConfig = options.thinkingConfig;
      }

      const response = await this.genAI.models.generateContent({
        model: this.configService.getOrThrow<string>(Env.GEMINI_MODEL),
        contents: content,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (!response.text) {
        this.logger.error('[GeminiAdapter]: Response text is empty');
        throw new InternalServerErrorException();
      }

      const endTime = Date.now();
      this.logger.log(
        `[GeminiAdapter]: END - Duration: ${endTime - startTime}ms`,
      );
      this.logger.log('[GeminiAdapter]: Response text');

      return response.text;
    } catch (error) {
      this.logger.error('[GeminiAdapter]: Error', error);
      throw error;
    }
  }
}
