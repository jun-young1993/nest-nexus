import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { AllConfigType } from 'src/config/config.type';
import { TranslateResponseDto } from './dto/translate-response.dto';

@Injectable()
export class LibreService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async isUse() {
    return this.configService.get('ai.libreTranslate.use', { infer: true });
  }

  async translate(
    text: string,
    source: string,
    target: string,
  ): Promise<TranslateResponseDto> {
    const ip = this.configService.get('ai.libreTranslate.ip', { infer: true });
    const port = this.configService.get('ai.libreTranslate.port', {
      infer: true,
    });
    const url = `${ip}:${port}/translate`;
    const response = await lastValueFrom<AxiosResponse<TranslateResponseDto>>(
      this.httpService.post(url, {
        q: text,
        source,
        target,
      }),
    );

    return response.data;
  }
}
