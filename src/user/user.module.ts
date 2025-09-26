import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserGroupController } from './user-group.controller';
import { UserGroupService } from './user-group.service';
import { UserBlockController } from './user-block.controller';
import { UserBlockService } from './user-block.service';
import { UserStorageLimitController } from './user-storage-limit.controller';
import { UserStorageLimitService } from './user-storage-limit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserGroup } from './entities/user-group.entity';
import { UserBlock } from './entities/user-block.entity';
import { UserStorageLimit } from './entities/user-storage-limit.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SequenceModule } from 'src/sequence/sequence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserGroup, UserBlock, UserStorageLimit]),
    AuthModule,
    SequenceModule,
  ],
  controllers: [
    UserController,
    UserGroupController,
    UserBlockController,
    UserStorageLimitController,
  ],
  providers: [
    UserService,
    UserGroupService,
    UserBlockService,
    UserStorageLimitService,
  ],
  exports: [
    UserService,
    UserGroupService,
    UserBlockService,
    UserStorageLimitService,
  ],
})
export class UserModule {}
