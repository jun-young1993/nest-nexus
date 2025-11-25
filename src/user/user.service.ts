import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from './enum/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async findByRegistrationIp(
    registrationIp: string,
    type: UserType,
  ): Promise<User[]> {
    return this.userRepository.find({ where: { registrationIp, type } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['userGroups'],
    });
  }

  async findOneOrFail(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id, isActive: true } });
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    const user = await this.findOneOrFail(id);
    if (updateUserDto.fcmToken === null) {
      updateUserDto.fcmToken = user.fcmToken;
    }

    await this.userRepository.update(id, updateUserDto);
  }

  async updateUserName(id: string, username: string): Promise<User> {
    await this.userRepository.update(id, { username });
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * FCM 토큰 업데이트 (PATCH)
   */
  async updateFcmToken(id: string, fcmToken: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. ID: ${id}`);
    }

    // FCM 토큰만 업데이트
    await this.userRepository.update(id, {
      fcmToken: fcmToken,
    });

    // 업데이트된 사용자 정보 반환
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * FCM 토큰 제거
   */
  async removeFcmToken(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. ID: ${id}`);
    }

    // FCM 토큰을 null로 설정
    await this.userRepository.update(id, {
      fcmToken: null,
    });

    // 업데이트된 사용자 정보 반환
    return this.userRepository.findOne({ where: { id } });
  }
}
