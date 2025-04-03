import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://your-production-domain.com']
      : ['http://localhost:4200', 'http://localhost:8100']; // Frontend Angular et Ionic

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Utile pour les sessions

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  }
}
