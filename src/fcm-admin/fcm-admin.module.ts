import { Module, DynamicModule } from '@nestjs/common';
import { FcmAdminService } from './fcm-admin.service';
import { AllConfigType, FcmConfig } from 'src/config/config.type';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class FcmAdminModule {
  static forRoot(config: FcmConfig): DynamicModule {
    return {
      module: FcmAdminModule,
      providers: [
        {
          provide: 'FcmAdminModule.FcmConfig',
          useValue: config,
        },
        FcmAdminService,
      ],
      exports: [FcmAdminService],
    };
  }

  static forRootAsync({
    useFactory,
  }: {
    useFactory: (configService: ConfigService<AllConfigType>) => FcmConfig;
  }): DynamicModule {
    return {
      module: FcmAdminModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'FcmAdminModule.FcmConfig',
          useFactory: useFactory,
          inject: [ConfigService],
        },
        FcmAdminService,
      ],
      exports: [FcmAdminService],
    };
  }
}
