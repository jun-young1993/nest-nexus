import { Global, Module } from '@nestjs/common';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [AxiosHttpModule],
  exports: [AxiosHttpModule],
})
export class HttpModule {}
