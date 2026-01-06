import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CloudRunDeepFaceService } from './cloud-run-deep-face.service';
import { CloudRunDeepFaceController } from './cloud-run-deep-face.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule, UserModule],
  providers: [CloudRunDeepFaceService],
  exports: [CloudRunDeepFaceService],
  controllers: [CloudRunDeepFaceController],
})
export class CloudRunDeepFaceModule {}
