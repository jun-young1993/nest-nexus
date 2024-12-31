import {
  GenerateContentRequest,
  GoogleGenerativeAI,
  Part,
} from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class GeminiService {
  private generativeAi: GoogleGenerativeAI;
  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.generativeAi = new GoogleGenerativeAI(
      configService.get('gemini.key', { infer: true }),
    );
  }

  async sendMessage(
    prompt: GenerateContentRequest | string | Array<string | Part>,
  ) {
    const modelType = 'gemini-1.5-pro';
    const model = this.generativeAi.getGenerativeModel({ model: modelType });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
}
