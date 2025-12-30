import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';

type UniversityRow = Database['public']['Tables']['university']['Row'];

@Injectable()
export class UniversitiesService {
  private readonly logger = new Logger(UniversitiesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all universities
   */
  async getUniversities(): Promise<UniversityRow[]> {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('university')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        this.logger.error('Error fetching universities:', error);
        throw new Error(`Failed to fetch universities: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} universities`);
      return data || [];
    } catch (error) {
      this.logger.error('Exception in getUniversities:', error);
      throw error;
    }
  }

  /**
   * Get university by ID
   */
  async getUniversityById(id: number): Promise<UniversityRow | null> {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('university')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          this.logger.warn(`University with id ${id} not found`);
          return null;
        }
        this.logger.error('Error fetching university:', error);
        throw new Error(`Failed to fetch university: ${error.message}`);
      }

      this.logger.log(`Successfully fetched university ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in getUniversityById:', error);
      throw error;
    }
  }
}

