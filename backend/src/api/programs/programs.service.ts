import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';

type ProgramRow = Database['public']['Tables']['programs']['Row'];
type UniversityRow = Database['public']['Tables']['university']['Row'];

export interface ProgramWithUniversity extends ProgramRow {
  university: UniversityRow | null;
}

@Injectable()
export class ProgramsService {
  private readonly logger = new Logger(ProgramsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all programs with university information
   */
  async getPrograms(): Promise<ProgramWithUniversity[]> {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('programs')
        .select(`
          *,
          university:university_id (
            id,
            name,
            city,
            state,
            university_type,
            description,
            website_url,
            email,
            phone_number,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching programs:', error);
        throw new Error(`Failed to fetch programs: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} programs`);
      return data as ProgramWithUniversity[];
    } catch (error) {
      this.logger.error('Exception in getPrograms:', error);
      throw error;
    }
  }

  /**
   * Get program by ID with university information
   */
  async getProgramById(id: number): Promise<ProgramWithUniversity | null> {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('programs')
        .select(`
          *,
          university:university_id (
            id,
            name,
            city,
            state,
            university_type,
            description,
            website_url,
            email,
            phone_number,
            logo_url,
            address
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          this.logger.warn(`Program with id ${id} not found`);
          return null;
        }
        this.logger.error('Error fetching program:', error);
        throw new Error(`Failed to fetch program: ${error.message}`);
      }

      this.logger.log(`Successfully fetched program ${id}`);
      return data as ProgramWithUniversity;
    } catch (error) {
      this.logger.error('Exception in getProgramById:', error);
      throw error;
    }
  }

  /**
   * Get programs by level (foundation, diploma, degree)
   * Maps lowercase frontend values to database enum values
   */
  async getProgramsByLevel(level: 'foundation' | 'diploma' | 'degree'): Promise<ProgramWithUniversity[]> {
    try {
      const db = this.supabaseService.getClient();
      
      // Map frontend lowercase values to database enum values
      const levelMap: Record<string, 'Foundation' | 'Diploma' | 'Bachelor'> = {
        'foundation': 'Foundation',
        'diploma': 'Diploma',
        'degree': 'Bachelor'
      };
      
      const dbLevel = levelMap[level];
      
      if (!dbLevel) {
        throw new Error(`Invalid program level: ${level}`);
      }
      
      const { data, error } = await db
        .from('programs')
        .select(`
          *,
          university:university_id (
            id,
            name,
            city,
            state,
            university_type,
            description,
            website_url,
            email,
            phone_number,
            logo_url
          )
        `)
        .eq('level', dbLevel)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching programs by level ${level}:`, error);
        throw new Error(`Failed to fetch programs: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} ${level} programs`);
      return data as ProgramWithUniversity[];
    } catch (error) {
      this.logger.error('Exception in getProgramsByLevel:', error);
      throw error;
    }
  }

  /**
   * Get programs by university ID
   */
  async getProgramsByUniversity(universityId: number): Promise<ProgramWithUniversity[]> {
    try {
      const db = this.supabaseService.getClient();
      
      const { data, error } = await db
        .from('programs')
        .select(`
          *,
          university:university_id (
            id,
            name,
            city,
            state,
            university_type,
            description,
            website_url,
            email,
            phone_number,
            logo_url
          )
        `)
        .eq('university_id', universityId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching programs for university ${universityId}:`, error);
        throw new Error(`Failed to fetch programs: ${error.message}`);
      }

      this.logger.log(`Successfully fetched ${data?.length || 0} programs for university ${universityId}`);
      return data as ProgramWithUniversity[];
    } catch (error) {
      this.logger.error('Exception in getProgramsByUniversity:', error);
      throw error;
    }
  }
}

