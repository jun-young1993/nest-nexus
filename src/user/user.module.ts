import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserGroupController } from './user-group.controller';
import { UserGroupService } from './user-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserGroup } from './entities/user-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserGroup])],
  controllers: [UserController, UserGroupController],
  providers: [UserService, UserGroupService],
  exports: [UserService, UserGroupService],
})
export class UserModule {}
