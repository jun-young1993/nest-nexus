import { ApiProperty } from '@nestjs/swagger';

export class QueryHotProductDto {
    @ApiProperty()
    app_key: string;

    @ApiProperty()
    timestamp: string;

    @ApiProperty()
    sign_method: string;

    @ApiProperty()
    sign: string;

    @ApiProperty()
    app_signature: string;

    @ApiProperty()
    category_ids: string;

    @ApiProperty()
    fields: string;

    @ApiProperty()
    keywords: string;

    @ApiProperty()
    max_sale_price: number;

    @ApiProperty()
    min_sale_price: number;

    @ApiProperty()
    page_no: number;

    @ApiProperty()
    page_size: number;

    @ApiProperty()
    platform_product_type: string;

    @ApiProperty()
    sort: string;

    @ApiProperty()
    target_currency: string;

    @ApiProperty()
    target_language: string;

    @ApiProperty()
    tracking_id: string;

    @ApiProperty()
    delivery_days: string;

    @ApiProperty()
    ship_to_country: string;
}
