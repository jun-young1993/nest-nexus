import { Injectable } from '@nestjs/common';
import {HttpService} from "@nestjs/axios";
import {lastValueFrom} from "rxjs";
import {QueryHotProductDto} from "./dto/query-hot-product.dto";

@Injectable()
export class AlieAffiliateService {
  constructor(private readonly httpService: HttpService) {}
  async queryHotProduct(queryHotProductDto: QueryHotProductDto) {
    const url = 'https://api.example.com/aliexpress.affiliate.hotproduct.query';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const data = new URLSearchParams(queryHotProductDto as any);

    const response = await lastValueFrom(
        this.httpService.post(url, data.toString(), { headers })
    );

    return response.data;
  }

}
