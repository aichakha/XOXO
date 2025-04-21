import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Request, 
  UnauthorizedException, 
  InternalServerErrorException, 
  BadRequestException 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  private client = new OAuth2Client('283729564854-tcu951t4hhh4ia3igcsmb0q53rvuh9uq.apps.googleusercontent.com');

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  @Post('signup')
  async signUp(@Body() body: SignupDto) {
    const { name, email, password } = body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email déjà existant');

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  const user = await this.prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  
  // Générer le token
  const token = this.jwtService.sign({ email: user.email, sub: user.id });

  // Retourner le token + infos
  return {
    message: 'Inscription réussie',
    token,
    userId: user.id,
    username: user.name
  };

  }

  @Post('signup-google')
async signupWithGoogle(@Body('token') token: string) {
  console.log("🔹 [Google Signup] Token reçu :", token);

  if (!token) {
    throw new UnauthorizedException('Token Google manquant');
  }

  try {
    const result = await this.authService.signupWithGoogle(token);

    return {
      message: 'Inscription avec Google réussie',
      token: result.token,
      userId: result.userId,
      username: result.username
    };
  } catch (error) {
    console.error('❌ [Google Signup] Erreur:', error);
    throw new InternalServerErrorException('Inscription Google échouée');
  }
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
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    console.log("🔹 [Profile] Requête reçue avec JWT :", req.headers.authorization);

    if (!req.user) {
      console.error("❌ [Profile] Utilisateur non trouvé !");
      throw new UnauthorizedException('Non autorisé');
    }

    return { message: 'Protected route accessed!', user: req.user };
  }

  @Post('google-login')
  async googleLogin(@Body('token') token: string) {
    console.log("🔹 [Google Login] Token reçu :", token);

    if (!token) {
      console.error("❌ [Google Login] Aucun token reçu !");
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const googleUser = await this.authService.googleLogin(token);
      console.log("✅ [Google Login] Utilisateur Google :", googleUser);

      if (!googleUser) {
        console.error("❌ [Google Login] Token Google invalide !");
        throw new UnauthorizedException('Token Google invalide');
      }

      const jwtToken = await this.authService.generateJwt(googleUser);
      console.log("✅ [Google Login] JWT généré :", jwtToken);

      return {
        message: 'Connexion Google réussie',
        token: jwtToken,
        userId: googleUser.id,// Replace 'id' with 'token' or another valid property
        username: googleUser.name
      };
    } catch (error) {
      console.error('❌ [Google Login] Erreur:', error);
      throw new InternalServerErrorException('Google login failed');
    }
  }
}
