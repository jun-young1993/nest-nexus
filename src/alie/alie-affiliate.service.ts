import { Injectable } from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {lastValueFrom, map} from "rxjs";
import {QueryHotProductDto} from "./dto/query-hot-product.dto";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";
import {stringify} from "querystring";
import {generateSign} from "../utils/alie";

@Injectable()
export class AlieAffiliateService {
  constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService<AllConfigType>,
  ) {}
  async queryHotProduct() {
    const url = 'https://api.example.com/aliexpress.affiliate.hotproduct.query';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };


    const response = await lastValueFrom(
        this.httpService.post(url,
            { headers })
    );

    return response;
  }
  async queryHotProducts(): Promise<any> {

    const params = {
      app_key: this.configService.get('alie.app_key',{infer: true}),
      timestamp: Date.now().toString(),
      sign_method: 'sha256',
      app_signature: 'sssfffxxgggg',
      category_ids: '111,222,333',
      fields: 'app_sale_price,shop_id',
      keywords: 'mp3',
      max_sale_price: '33333',
      min_sale_price: '22222',
      page_no: '111',
      page_size: '50',
      platform_product_type: 'ALL',
      sort: 'SALE_PRICE_ASC',
      target_currency: 'USD',
      target_language: 'EN',
      tracking_id: 'trackingId',
      delivery_days: '3',
      ship_to_country: 'US',
    };

    // params['sign'] = generateSign(
    //     this.configService.get('alie.app_secret',{infer: true}),
    //     params
    // )

    const queryString = stringify(params);

    const response = await this.httpService.post(
        `${this.configService.get('alie.app_secret',{infer: true})}/aliexpress.affiliate.hotproduct.query`,
        queryString,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
    );

    return response;
  }
}
