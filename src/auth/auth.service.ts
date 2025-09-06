import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginInput } from './models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser({
    email,
    password,
  }: LoginDto | LoginInput): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'password', 'email'], // 비밀번호 포함 조회
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(
    user: User,
    options?: JwtSignOptions,
  ): Promise<{ accessToken: string }> {
    const payload = { username: user.username, sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload, options),
    };
  }
  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // ✅ JWT 디코딩 (검증 포함)
      const decoded = this.jwtService.verify(token);

      // ✅ 디코딩된 `sub`(user ID) 값으로 유저 정보 조회
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
        select: ['id', 'username', 'email', 'createdAt'], // 비밀번호 포함 조회
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      return null;
    }
  }
}
