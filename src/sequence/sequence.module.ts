import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';
import { Sequence } from './entities/sequence.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sequence]), AuthModule],
  controllers: [SequenceController],
  providers: [SequenceService],
  exports: [SequenceService],
})
export class SequenceModule {}
