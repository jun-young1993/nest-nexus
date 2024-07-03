import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AllConfigType } from 'src/config/config.type';
import { CallbackQueryDto } from './dto/callback-dto';
import { generateSign } from 'src/utils/alie';

@Injectable()
export class AlieAuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}
  async callback() {

    return 'test';
  }

  async oAuth(){
    const params = {
      response_type: 'code',
      force_auth: 'true',
      redirect_uri: this.configService.get('alie.auth_callback_url',{infer: true}),
      client_id: this.configService.get('alie.app_key',{infer: true}),
    };
  
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.configService.get('alie.url',{infer: true})}/oauth/authorize`,
        {params}
      )
    );
    
    return response.data;
  }

  async getGenerateToken({code}: CallbackQueryDto){
    console.log('code',code);
    const params = {
      app_key: this.configService.get('alie.app_key',{infer: true}),
      timestamp: new Date().getTime(),
      sign_method: "sha256",
      code: code,
      uuid: 'uuid'
    }
    console.log(params);
    const sign = generateSign(
      '/rest/auth/token/create',
      this.configService.get('alie.app_secret',{infer: true}),
      params
    );
    
    params['sign'] = sign;
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.configService.get('alie.url',{infer: true})}/rest/auth/token/create`,
        {params}
      )
    );

    console.log(response.data);
    return response.data;
  }
}
