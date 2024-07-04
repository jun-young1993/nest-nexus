import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AllConfigType } from 'src/config/config.type';
import { CallbackQueryDto } from './dto/callback-dto';
import { generateSign } from 'src/utils/alie';
import {stringify} from 'qs';

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
    const apiPath = '/auth/token/create';
    const signMethod = 'sha256'
    const params = {
      app_key: this.configService.get('alie.app_key',{infer: true}),
      timestamp: Date.now().toString(),
      sign_method: signMethod,
      code: code
    };
    const sign = generateSign(
      apiPath, 
      params, 
      this.configService.get('alie.app_secret',{infer: true}),
      signMethod
    );
    params['sign'] = sign;
    const url = `${this.configService.get('alie.url',{infer: true})}/rest${apiPath}?${stringify(params)}`
    console.log(url);

    const response = await lastValueFrom(this.httpService.get(url));
    return response.data;
  }
}
