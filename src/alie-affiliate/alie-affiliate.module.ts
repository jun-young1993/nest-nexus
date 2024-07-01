import { Module } from '@nestjs/common';
import { AlieAffiliateService } from './alie-affiliate.service';
import { AlieAffiliateController } from './alie-affiliate.controller';

@Module({
  controllers: [AlieAffiliateController],
  providers: [AlieAffiliateService],
})
export class AlieAffiliateModule {}
