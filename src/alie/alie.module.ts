import { Module } from '@nestjs/common';
import { AlieAffiliateService } from './alie-affiliate.service';
import { AlieAffiliateController } from './alie-affiliate.controller';
import { AlieAuthController } from './alie-auth.controller';
import { AlieAuthService } from './alie-auth.service';

@Module({
  controllers: [AlieAffiliateController, AlieAuthController],
  providers: [AlieAffiliateService, AlieAuthService],
  exports: [AlieAffiliateService],
})
export class AlieModule {}
