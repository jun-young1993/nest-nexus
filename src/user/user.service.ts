import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id, isActive: true } });
  }

  async findOneOrFail(id: string): Promise<User> {
    return this.userRepository.findOneOrFail({ where: { id, isActive: true } });
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    await this.findOneOrFail(id);
    await this.userRepository.update(id, updateUserDto);
  }
}
