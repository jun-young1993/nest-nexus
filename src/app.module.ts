import { Module } from '@nestjs/common';
import {HttpModule} from "./http/http.module";
import { AlieAffiliateModule } from './alie/alie.module';

@Module({
  imports: [
      HttpModule,
      AlieAffiliateModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
