import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { AlieAffiliateService } from './alie-affiliate.service';
import {QueryHotProductDto} from "./dto/query-hot-product.dto";
import {ApiBody, ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger";
import { HotProductDto } from './dto/hot-product.dto';


@ApiTags('alie-affiliate')
@Controller('alie-affiliate')
export class AlieAffiliateController {
  constructor(private readonly alieAffiliateService: AlieAffiliateService) {}

  @Get('hot-products')
  @ApiOperation({ summary: `get hot products`} )
  async queryHotProduct(@Query() query: HotProductDto) {
    return await this.alieAffiliateService.queryHotProducts(query.category_id);
  }


  @Get('categories')
  @ApiOperation({summary: 'get categories'})
  async getCategories(){
    return await this.alieAffiliateService.getCategories();
  }
}
