import { Test, TestingModule } from '@nestjs/testing';
import { AlieAffiliateController } from './alie-affiliate.controller';
import { AlieAffiliateService } from './alie-affiliate.service';
import { QueryHotProductDto } from './dto/query-hot-product.dto';

describe('AlieAffiliateController', () => {
  let controller: AlieAffiliateController;
  let service: AlieAffiliateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlieAffiliateController],
      providers: [
        {
          provide: AlieAffiliateService,
          useValue: {
            queryHotProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AlieAffiliateController>(AlieAffiliateController);
    service = module.get<AlieAffiliateService>(AlieAffiliateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('queryHotProduct', () => {
    it('should call service with correct params', async () => {
      const dto: QueryHotProductDto = {
        app_key: '12345678',
        timestamp: '1719846546500',
        sign_method: 'sha256',
        sign: 'D13F2A03BE94D9AAE9F933FFA7B13E0A5AD84A3DAEBC62A458A3C382EC2E91EC',
        app_signature: 'sssfffxxgggg',
        category_ids: '111,222,333',
        fields: 'app_sale_price,shop_id',
        keywords: 'mp3',
        max_sale_price: 33333,
        min_sale_price: 22222,
        page_no: 111,
        page_size: 50,
        platform_product_type: 'ALL',
        sort: 'SALE_PRICE_ASC',
        target_currency: 'USD',
        target_language: 'EN',
        tracking_id: 'trackingId',
        delivery_days: '3',
        ship_to_country: 'US',
      };

      await controller.queryHotProduct(dto);
      expect(service.queryHotProduct).toHaveBeenCalledWith(dto);
    });
  });
});
