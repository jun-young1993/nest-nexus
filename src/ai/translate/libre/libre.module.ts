import { Module } from '@nestjs/common';
import { LibreService } from './libre.service';
import { LibreController } from './libre.controller';

@Module({
  controllers: [LibreController],
  providers: [LibreService],
  exports: [LibreService],
})
export class LibreModule {}
