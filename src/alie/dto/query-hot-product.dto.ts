import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryHotProductDto {
  @ApiProperty()
  app_key: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  sign_method: string;

  @ApiProperty()
  sign: string;

  @IsOptional()
  @ApiProperty({
    description: 'API signature',
  })
  app_signature?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'List of category ID, you can get category ID via "get category" API https://developers.aliexpress.com/en/doc.htm?docId=45801&docType=2',
  })
  category_ids?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Respond parameter list, eg: commission_rate,sale_price',
  })
  fields?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Filter products by keywords. eg: mp3',
  })
  keywords?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Filter products by highest price, unit cent',
  })
  max_sale_price?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Filter products by lowest price, unit cent',
  })
  min_sale_price?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Page number',
  })
  page_no?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Record count of each page, 1 - 50',
  })
  page_size?: number;

  @IsOptional()
  @ApiProperty({
    description: 'product type：ALL,PLAZA,TMALL',
  })
  platform_product_type?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'sort by:SALE_PRICE_ASC, SALE_PRICE_DESC, LAST_VOLUME_ASC, LAST_VOLUME_DESC',
  })
  sort?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'target currency:USD, GBP, CAD, EUR, UAH, MXN, TRY, RUB, BRL, AUD, INR, JPY, IDR, SEK,KRW',
  })
  target_currency?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'target language:EN,RU,PT,ES,FR,ID,IT,TH,JA,AR,VI,TR,DE,HE,KO,NL,PL,MX,CL,IW,IN',
  })
  target_language?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Your trackingID',
  })
  tracking_id?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'Estimated delivery days. 3：in 3 days，5：in 5 days，7：in 7 days，10：in 10 days',
  })
  delivery_days?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'The Ship to country. Filter products that can be sent to that country; Returns the price according to the country’s tax rate policy.',
  })
  ship_to_country?: string;
}
