import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AllConfigType } from 'src/config/config.type';
import {generateSign} from "../utils/alie";

@Injectable()
export class AlieAuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}
  async callback() {

    return 'test';
  }
  async getAuthorizationCode(){
    

    const body = {
      response_type: 'code',
      force_auth: true,
      redirect_uri: this.configService.get('alie.auth_callback_url',{infer: true}),
      client_id: this.configService.get('alie.app_key',{infer: true})
    }
    const sign = generateSign(
        this.configService.get('alie.app_secret',{infer: true}),
        body
    )
    console.log(sign);
    console.log("=>(alie-auth.service.ts:27) body", body);
    const response = await lastValueFrom(
        this.httpService.post(
          this.configService.get('alie.url',{infer: true})+'/oauth/authorize',
            {body}
      )
    )

    
    return response.data;
  }

  async createAccessToken(){
    const params = {
      timestamp: new Date().getTime(),
      sign_method : 'sha256',
      app_key: this.configService.get('alie.app_key',{infer: true}),
      // code: '3_500054_hWx3Yb1b921eNhi26CinYnRp30285',
      sign: null
    };


    const sign = generateSign(
        this.configService.get('alie.app_secret',{infer: true}),
        params
    )
    console.log(sign);

    params.sign = sign;
    console.log("=>(alie-auth.service.ts:27) body", params);
    const response = await lastValueFrom(
        this.httpService.get(
            this.configService.get('alie.url',{infer: true})+'/rest/auth/token/create',
            {params}
        )
    )
console.log("=>(alie-auth.service.ts:52) response.data", response.data);

    return response.data;
  }

}
