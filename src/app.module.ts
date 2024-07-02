import { Module } from '@nestjs/common';
import {HttpModule} from "./http/http.module";
import { AlieModule } from './alie/alie.module';
@Module({
  imports: [
      HttpModule,
      AlieModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
