// src/common/types/authenticated-request.ts
import { Request } from 'express';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from 'src/supabase/types/supabase.types';

export interface AuthenticatedRequest extends Request {
  supabase: SupabaseClient<Database>;
  user: User;
}
