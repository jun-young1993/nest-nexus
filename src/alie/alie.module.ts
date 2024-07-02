import { Module } from '@nestjs/common';
import { AlieAffiliateService } from './alie-affiliate.service';
import { AlieAffiliateController } from './alie-affiliate.controller';
import { AlieAuthController } from './alie-auth.controller';
import { AlieAuthService } from './alie-auth.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig
      ],
      envFilePath: ['.env']
    })
  ],
  controllers: [AlieAffiliateController, AlieAuthController],
  providers: [AlieAffiliateService, AlieAuthService],
})
export class AlieModule {}
