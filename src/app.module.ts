import { Module } from '@nestjs/common';
import {HttpModule} from "./http/http.module";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlieAffiliateModule } from './alie-affiliate/alie-affiliate.module';

@Module({
  imports: [
      HttpModule,
      AlieAffiliateModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
