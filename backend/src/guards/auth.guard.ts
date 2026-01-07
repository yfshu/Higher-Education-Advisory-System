import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from '@supabase/supabase-js';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('SESSION_EXPIRED');
    }

    const token = authHeader.substring('Bearer '.length);

    try {
      const userClient = this.supabaseService.createUserClient(token);

      const {
        data: { user },
        error,
      } = await userClient.auth.getUser();

      if (error || !user) {
        throw new UnauthorizedException('SESSION_EXPIRED');
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('SESSION_EXPIRED');
    }
  }
}
