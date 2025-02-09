import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "../user/entities/user.entity";
import {LoginDto} from "./dto/login.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a Auth Token' }) // API 설명
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('login')
  async login(
      @Body() loginDto: LoginDto
  ): Promise<{ accessToken: string }> {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }
}