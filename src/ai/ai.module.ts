import { Module } from '@nestjs/common';
import { TranslateModule } from './translate/translate.module';

@Module({
  imports: [TranslateModule],
  exports: [TranslateModule],
})
export class AiModule {}
