import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,private jwtService: JwtService) {}

  async signUp(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({ data: { name, email, password: hashedPassword } });
  }

  async login(email: string, password: string) {
    console.log('Login attempt for:', email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('User found:', user);
    if (!user) throw new UnauthorizedException('Invalid credentials');
   
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password from request:', password);
    console.log('Hashed password from DB:', user.password);
    console.log('Password match:', passwordMatch);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    return { 
      message: 'Login successful', 
      userId: user.id, 
      token 
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
  
    const resetToken = randomUUID(); // Génère un token unique
    await this.prisma.user.update({ where: { email }, data: { resetToken } });
  
    return { message: 'Password reset token generated',email, token: resetToken };
  }
  

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({ 
      where: { email, resetToken: token }  // Vérification supplémentaire sur l'email
    });
  
    console.log('🔍 User found:', user);
    if (!user) throw new BadRequestException('Invalid or expired reset token');
  
    console.log('🔄 Reset password for user:', user.email);
    console.log('🔑 Old hashed password:', user.password);
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔒 New hashed password:', hashedPassword);
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null },
      select: { password: true, updatedAt: true }
    });
  
    console.log('✅ Password reset successfully!');
    return { message: 'Password successfully reset' };
  }
  
  
}
