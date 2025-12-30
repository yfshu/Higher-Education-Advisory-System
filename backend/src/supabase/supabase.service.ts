// supabase-request.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Database } from './types/supabase.types';

// Ensure environment variables from .env are loaded in all runtime contexts.
// Try both the process cwd and the backend folder explicitly.
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
];
envPaths.forEach((p) => {
  dotenv.config({ path: p });
});

@Injectable()
export class SupabaseService {
  private supabaseUrl = process.env.SUPABASE_URL!;
  private serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  private anonKey = process.env.SUPABASE_ANON_KEY!;

  getClient() {
    if (!this.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!this.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }
    return createClient<Database>(this.supabaseUrl, this.serviceRoleKey);
  }

  getAuthClient() {
    if (!this.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!this.anonKey) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }
    return createClient<Database>(this.supabaseUrl, this.anonKey);
  }

  createClientWithToken(token?: string) {
    if (token) {
      return createClient<Database>(this.supabaseUrl, this.serviceRoleKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    }

    // Fallback: anonymous client

    return createClient<Database>(this.supabaseUrl, this.serviceRoleKey);
  }

  /**
   * Create a client with user token using anon key (respects RLS)
   * Use this for operations that need RLS enforcement
   */
  createUserClient(token: string) {
    if (!this.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!this.anonKey) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }
    return createClient<Database>(this.supabaseUrl, this.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
}
