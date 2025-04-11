import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('❌ GOOGLE_CLIENT_ID non défini dans les variables d’environnement');
    }
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // ✅ Vérification du Token Google
  async verifyToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      console.log('✅ User Info:', ticket.getPayload());
    } catch (error) {
      console.error('❌ Échec de la vérification du token:', error);
      throw new UnauthorizedException('Token invalide');
    }
  }

  // ✅ Inscription utilisateur
  async signUp(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
  }

  // ✅ Connexion utilisateur
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Identifiants invalides');

    return {
      message: 'Connexion réussie',
      userId: user.id,
      token: this.jwtService.sign({ email: user.email, sub: user.id }),
      username: user.name,
    };
  }

  // ✅ Générer un token de réinitialisation
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    const resetToken = randomUUID();
    await this.prisma.user.update({
      where: { email },
      data: { resetToken },
    });

    return { message: 'Token de réinitialisation généré', email, token: resetToken };
  }

  // ✅ Réinitialisation du mot de passe
  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, resetToken: token },
    });

    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // ✅ Génération du JWT
  async generateJwt(user: any) {
    return this.jwtService.sign({ email: user.email, sub: user.id });
  }

  // ✅ Connexion via Google
  async googleLogin(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name) throw new UnauthorizedException('Token Google invalide ou incomplet');

      // Vérifier si l'utilisateur existe
      let user = await this.prisma.user.findUnique({ where: { email: payload.email } });

      // Si l'utilisateur n'existe pas, le créer
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            name: payload.name,
            email: payload.email,
            password: '', // Pas de mot de passe stocké pour Google
          },
        });
      }

    // Retourner l'utilisateur complet (pas le token)
    return user;

  } catch (error) {
    console.error("❌ [Google Login] Erreur:", error);
    throw new UnauthorizedException('Échec de la connexion Google');
  }
  }
  async signupWithGoogle(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name) {
        throw new UnauthorizedException('Token Google invalide ou incomplet');
      }
  
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findUnique({ where: { email: payload.email } });
      if (existingUser) {
        throw new BadRequestException('Un compte avec cet email existe déjà. Veuillez vous connecter.');
      }
  
      // Créer le compte utilisateur (sans mot de passe)
      const user = await this.prisma.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          password: '', // pas de mot de passe pour Google
        },
      });
  
      const tokenJwt = await this.generateJwt(user);
  
      return {
        token: tokenJwt,
        userId: user.id,
        username: user.name
      };
    } catch (error) {
      console.error('❌ [Google Signup Service] Erreur:', error);
      throw new InternalServerErrorException('Erreur pendant l’inscription via Google');
    }
  }
  
}
