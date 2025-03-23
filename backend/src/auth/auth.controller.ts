import { Body, Controller, Post,Get,Request  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignupDto) {
    return this.authService.signUp(body.name, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    console.log('📩 Reset password request received:', body);
    return this.authService.resetPassword(body.email, body.token, body.newPassword);
}
@Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Request() req) {
    return { message: 'Protected route accessed!', user: req.user };
  }

}
