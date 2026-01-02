import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from '@supabase/supabase-js';

// Extend Express Request to include user
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
      // Create a user client with the token
      const userClient = this.supabaseService.createUserClient(token);
      
      // Verify the token and get the user
      const {
        data: { user },
        error,
      } = await userClient.auth.getUser();

      if (error || !user) {
        throw new UnauthorizedException('SESSION_EXPIRED');
      }

      // Attach user to request object
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

