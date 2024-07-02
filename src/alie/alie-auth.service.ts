import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AllConfigType } from 'src/config/config.type';

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
      action: '/authrize_action',
      event_submit_do_auth: 'event_submit_do_auth',
      response_type: 'code',
      force_auth: 'true',
      redirect_uri: this.configService.get('alie.auth_callback_url',{infer: true}),
      client_id: this.configService.get('alie.app_key',{infer: true})
    }
    
    const response = lastValueFrom(this.httpService.post(
        this.configService.get('alie.url',{infer: true}),
        {body}
      ))
    
    
    return await response;
  }

}
