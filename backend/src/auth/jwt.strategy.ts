import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
    });
  }

  async validate(payload: any) {
    console.log('🔐 Token reçu pour validation:', payload);
    return { userId: payload.sub, email: payload.email,last4Digits: payload.last4Digits  };
  }
  async validate1(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
