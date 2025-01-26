import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
      @Body('email') email: string,
      @Body('password') password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }
}