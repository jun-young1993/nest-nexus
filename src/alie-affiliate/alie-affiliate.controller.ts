import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { AlieAffiliateService } from './alie-affiliate.service';
import {QueryHotProductDto} from "./dto/query-hot-product.dto";
import {ApiBody, ApiTags} from "@nestjs/swagger";


@ApiTags('alie-affiliate')
@Controller('alie-affiliate')
export class AlieAffiliateController {
  constructor(private readonly alieAffiliateService: AlieAffiliateService) {}

  @Get()
  @ApiBody({ type: QueryHotProductDto })
  async queryHotProduct(@Query() query: QueryHotProductDto) {
    return await this.alieAffiliateService.queryHotProduct(query);
  }
}
