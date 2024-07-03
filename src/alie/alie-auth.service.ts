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


}
