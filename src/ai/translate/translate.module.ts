import { Module } from '@nestjs/common';
import { LibreModule } from './libre/libre.module';

@Module({
  controllers: [],
  imports: [LibreModule],
  exports: [LibreModule],
})
export class TranslateModule {}
