import { Injectable } from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";
import {stringify} from "querystring";
import {generateSignature} from "../utils/alie";
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AlieAffiliateService {
  constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async businessApi(method: string, args?: object){
    const apiPath = '/sync';
    const signMethod = 'sha256'
    const params = {
      access_token: this.configService.get('alie.access_token',{infer: true}),
      app_key: this.configService.get('alie.app_key',{infer: true}),
      timestamp: Date.now().toString(),
      sign_method: signMethod,
      method: method,
      ...(args && args)
    }
    
    const sign = generateSignature(
        params,
        this.configService.get('alie.app_secret',{infer: true}),
    );

    params['sign'] = sign;

    const url = `${this.configService.get('alie.url',{infer: true})}${apiPath}?${stringify(params)}`;
    const response = await lastValueFrom(this.httpService.post(url))

    return response.data;
  }

  async getCategories(){
    return await this.businessApi(
        'aliexpress.affiliate.category.get'
    );
  }

  /**
   * hot - product
   */
  async queryHotProducts(category_id: number): Promise<any> {
    return await this.businessApi(
        'aliexpress.affiliate.hotproduct.query',
        {
          fields: "commission_rate,sale_price",
          category_ids: category_id.toString(),
          target_currency: "USD",
          target_language: "EN",
          tracking_id: "default",
          ship_to_country: "US",
          page_no: "1",
          page_size: "50",
        }
    )
  }

}
