import { Module } from '@nestjs/common';
import {HttpModule} from "./http/http.module";
import { AlieModule } from './alie/alie.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import alieConfig from './config/alie.config';
@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          appConfig,
          alieConfig
        ],
        envFilePath: ['.env']
      }),
      HttpModule,
      AlieModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
