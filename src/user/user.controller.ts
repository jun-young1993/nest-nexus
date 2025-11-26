import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SequenceService } from 'src/sequence/sequence.service';
import { SequenceName } from 'src/sequence/sequence.constance';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('Users') // Swagger 그룹 태그
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sequenceService: SequenceService,
  ) {}

  @ApiOperation({ summary: 'Create a new user' }) // API 설명
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post()
  async createUser(
    @RealIP() ip: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    const count = await this.sequenceService.generateNextSequence(
      SequenceName.USER_NUMBER,
    );
    if (createUserDto.username === null) {
      createUserDto.username = `user ${count}`;
    }
    createUserDto.registrationIp = createUserDto.registrationIp || ip;
    // const users = await this.userService.findByRegistrationIp(
    //   createUserDto.registrationIp,
    //   createUserDto.type,
    // );
    // if (users.length > 5) {
    //   throw new HttpException(
    //     `Too many users : total count => ${users.length}`,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Get all users',
    type: [User],
  })
  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get a user by ID',
    type: User,
  })
  @ApiResponse({
    status: 204,
    description: 'User not found - No Content',
  })
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NO_CONTENT);
    }
    return user;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update user FCM token' })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Patch(':id/fcm-token/:fcmToken')
  async updateFcmToken(
    @Param('id') id: string,
    @Param('fcmToken') fcmToken: string,
  ): Promise<User> {
    return this.userService.updateFcmToken(id, fcmToken);
  }

  @ApiOperation({ summary: 'Remove user FCM token' })
  @ApiResponse({
    status: 200,
    description: 'FCM token removed successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Delete(':id/fcm-token')
  async removeFcmToken(@Param('id') id: string): Promise<User> {
    return this.userService.removeFcmToken(id);
  }

  @ApiOperation({ summary: 'Update user name' })
  @ApiResponse({
    status: 200,
    description: 'User name updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'username', description: 'User name' })
  @Patch(':id/username/:username')
  async updateUserName(
    @Param('id') id: string,
    @Param('username') username: string,
  ): Promise<User> {
    return this.userService.updateUserName(id, username);
  }
}
