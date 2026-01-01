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
   * Fetches all records by using pagination to bypass Supabase's 1000 row limit
   * @param includeAllStatuses - If true, fetches all programs regardless of status (for admin)
   */
  async getPrograms(includeAllStatuses: boolean = false): Promise<ProgramWithUniversity[]> {
    try {
      const db = this.supabaseService.getClient();
      const allPrograms: ProgramWithUniversity[] = [];
      const batchSize = 1000;
      let from = 0;
      let to = batchSize - 1;
      let hasMore = true;
      let iteration = 0;
      const maxIterations = 10; // Safety limit to prevent infinite loops

      this.logger.log(`Starting to fetch programs${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`);

      while (hasMore && iteration < maxIterations) {
        iteration++;
        this.logger.log(`Fetching batch ${iteration}, range: ${from} to ${to}`);

        let query = db
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
          .order('id', { ascending: true })
          .range(from, to);

        // Only filter by status if not including all statuses
        if (!includeAllStatuses) {
          query = query.eq('status', 'active');
        }

        const { data, error, count } = await query;

        if (error) {
          this.logger.error(`Error fetching programs batch ${iteration}:`, error);
          throw new Error(`Failed to fetch programs: ${error.message}`);
        }

        if (data && data.length > 0) {
          this.logger.log(`Batch ${iteration}: Fetched ${data.length} programs (range ${from}-${to})`);
          allPrograms.push(...(data as ProgramWithUniversity[]));
          
          // Move to next batch
          from = to + 1;
          to = from + batchSize - 1;
          
          // If we got fewer records than requested, we've reached the end
          hasMore = data.length === batchSize;
          this.logger.log(`Batch ${iteration}: Total so far: ${allPrograms.length}, Has more: ${hasMore}`);
        } else {
          this.logger.log(`Batch ${iteration}: No more data`);
          hasMore = false;
        }
      }

      if (iteration >= maxIterations) {
        this.logger.warn(`Reached max iterations (${maxIterations}), stopping pagination. Total fetched: ${allPrograms.length}`);
      }

      // Now sort by created_at descending as originally intended
      allPrograms.sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });

      this.logger.log(`✅ Successfully fetched ${allPrograms.length} programs${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`);
      return allPrograms;
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
      
      // Map frontend lowercase values to database enum values (lowercase)
      const levelMap: Record<string, 'foundation' | 'diploma' | 'degree'> = {
        'foundation': 'foundation',
        'diploma': 'diploma',
        'degree': 'degree',
        'bachelor': 'degree' // Map legacy 'bachelor' to 'degree'
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
        .eq('level', dbLevel as any) // Type assertion: database enum uses lowercase values
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

  /**
   * Create a new program
   */
  async createProgram(programData: any): Promise<ProgramWithUniversity> {
    try {
      const db = this.supabaseService.getClient();

      // Map frontend level values to database enum values (lowercase)
      if (programData.level && typeof programData.level === 'string') {
        const levelMap: Record<string, 'foundation' | 'diploma' | 'degree'> = {
          'foundation': 'foundation',
          'diploma': 'diploma',
          'degree': 'degree',
          'bachelor': 'degree', // Map legacy 'bachelor' to 'degree'
          'Foundation': 'foundation',
          'Diploma': 'diploma',
          'Bachelor': 'degree', // Map capitalized 'Bachelor' to lowercase 'degree'
        };
        const mappedLevel = levelMap[programData.level] || levelMap[programData.level.toLowerCase()];
        if (mappedLevel) {
          programData.level = mappedLevel;
        }
      }

      // Ensure status defaults to 'active' if not provided
      if (!programData.status) {
        programData.status = 'active';
      }

      // Ensure currency defaults to 'MYR' if not provided
      if (!programData.currency) {
        programData.currency = 'MYR';
      }

      // Convert JSONB fields if they're strings
      if (programData.entry_requirements && typeof programData.entry_requirements === 'string') {
        try {
          programData.entry_requirements = JSON.parse(programData.entry_requirements);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.curriculum && typeof programData.curriculum === 'string') {
        try {
          programData.curriculum = JSON.parse(programData.curriculum);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.career_outcomes && typeof programData.career_outcomes === 'string') {
        try {
          programData.career_outcomes = JSON.parse(programData.career_outcomes);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.facilities && typeof programData.facilities === 'string') {
        try {
          programData.facilities = JSON.parse(programData.facilities);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.tags && typeof programData.tags === 'string') {
        try {
          programData.tags = JSON.parse(programData.tags);
        } catch {
          // Keep as is if parsing fails
        }
      }

      const { data, error } = await db
        .from('programs')
        .insert(programData)
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
        .single();

      if (error) {
        this.logger.error('Error creating program:', error);
        throw new Error(`Failed to create program: ${error.message}`);
      }

      this.logger.log(`Successfully created program: ${data?.id}`);
      return data as ProgramWithUniversity;
    } catch (error) {
      this.logger.error('Exception in createProgram:', error);
      throw error;
    }
  }

  /**
   * Update an existing program
   */
  async updateProgram(id: number, programData: any): Promise<ProgramWithUniversity> {
    try {
      const db = this.supabaseService.getClient();

      // Map frontend level values to database enum values (lowercase)
      if (programData.level && typeof programData.level === 'string') {
        const levelMap: Record<string, 'foundation' | 'diploma' | 'degree'> = {
          'foundation': 'foundation',
          'diploma': 'diploma',
          'degree': 'degree',
          'bachelor': 'degree', // Map legacy 'bachelor' to 'degree'
          'Foundation': 'foundation',
          'Diploma': 'diploma',
          'Bachelor': 'degree', // Map capitalized 'Bachelor' to lowercase 'degree'
        };
        const mappedLevel = levelMap[programData.level] || levelMap[programData.level.toLowerCase()];
        if (mappedLevel) {
          programData.level = mappedLevel;
        }
      }

      // Convert JSONB fields if they're strings
      if (programData.entry_requirements && typeof programData.entry_requirements === 'string') {
        try {
          programData.entry_requirements = JSON.parse(programData.entry_requirements);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.curriculum && typeof programData.curriculum === 'string') {
        try {
          programData.curriculum = JSON.parse(programData.curriculum);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.career_outcomes && typeof programData.career_outcomes === 'string') {
        try {
          programData.career_outcomes = JSON.parse(programData.career_outcomes);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.facilities && typeof programData.facilities === 'string') {
        try {
          programData.facilities = JSON.parse(programData.facilities);
        } catch {
          // Keep as is if parsing fails
        }
      }
      if (programData.tags && typeof programData.tags === 'string') {
        try {
          programData.tags = JSON.parse(programData.tags);
        } catch {
          // Keep as is if parsing fails
        }
      }

      // Add updated_at timestamp
      programData.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('programs')
        .update(programData)
        .eq('id', id)
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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Program with id ${id} not found for update`);
          throw new Error('Program not found');
        }
        this.logger.error('Error updating program:', error);
        throw new Error(`Failed to update program: ${error.message}`);
      }

      this.logger.log(`Successfully updated program: ${id}`);
      return data as ProgramWithUniversity;
    } catch (error) {
      this.logger.error('Exception in updateProgram:', error);
      throw error;
    }
  }

  /**
   * Delete a program (hard delete - permanently removes from database)
   */
  async deleteProgram(id: number): Promise<void> {
    try {
      const db = this.supabaseService.getClient();

      // Hard delete - permanently remove from database
      const { error } = await db
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Program with id ${id} not found for deletion`);
          throw new Error('Program not found');
        }
        this.logger.error('Error deleting program:', error);
        throw new Error(`Failed to delete program: ${error.message}`);
      }

      this.logger.log(`Successfully deleted program: ${id}`);
    } catch (error) {
      this.logger.error('Exception in deleteProgram:', error);
      throw error;
    }
  }
}

