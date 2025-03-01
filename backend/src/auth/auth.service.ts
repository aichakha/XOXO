import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({ data: { name, email, password: hashedPassword } });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return { message: 'Login successful', userId: user.id };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
  
    const resetToken = Math.random().toString(36).substring(2, 8); // Générer un token temporaire
  
    // Stocker le token en base
    await this.prisma.user.update({
      where: { email },
      data: { resetToken },
    });
  
    return { message: 'Password reset token generated', token: resetToken };
  }
  

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired reset token');
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null }, // Réinitialise le token
    });
  
    return { message: 'Password successfully reset' };
  }
  
}
