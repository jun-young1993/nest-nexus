import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class HotProductDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description:
      'List of category ID, you can get category ID via "get category" API https://developers.aliexpress.com/en/doc.htm?docId=45801&docType=2',
    type: Number,
  })
  category_id: number;
}
