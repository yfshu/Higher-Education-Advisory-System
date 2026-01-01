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

  /**
   * Create a new university
   */
  async createUniversity(universityData: any): Promise<UniversityRow> {
    try {
      const db = this.supabaseService.getClient();

      // Convert image_urls array to JSON if it's an array
      if (universityData.image_urls && Array.isArray(universityData.image_urls)) {
        universityData.image_urls = JSON.stringify(universityData.image_urls);
      }

      const { data, error } = await db
        .from('university')
        .insert(universityData)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating university:', error);
        throw new Error(`Failed to create university: ${error.message}`);
      }

      this.logger.log(`Successfully created university: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in createUniversity:', error);
      throw error;
    }
  }

  /**
   * Update an existing university
   */
  async updateUniversity(id: number, universityData: any): Promise<UniversityRow> {
    try {
      const db = this.supabaseService.getClient();

      // Convert image_urls array to JSON if it's an array
      if (universityData.image_urls && Array.isArray(universityData.image_urls)) {
        universityData.image_urls = JSON.stringify(universityData.image_urls);
      }

      // Add updated_at timestamp
      universityData.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('university')
        .update(universityData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`University with id ${id} not found for update`);
          throw new Error('University not found');
        }
        this.logger.error('Error updating university:', error);
        throw new Error(`Failed to update university: ${error.message}`);
      }

      this.logger.log(`Successfully updated university: ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in updateUniversity:', error);
      throw error;
    }
  }

  /**
   * Delete a university and all linked programs (cascade delete)
   */
  async deleteUniversity(id: number): Promise<void> {
    try {
      const db = this.supabaseService.getClient();

      // First, delete all programs linked to this university
      const { error: programsError } = await db
        .from('programs')
        .delete()
        .eq('university_id', id);

      if (programsError) {
        this.logger.error('Error deleting linked programs:', programsError);
        throw new Error(`Failed to delete linked programs: ${programsError.message}`);
      }

      // Then delete the university
      const { error: universityError } = await db
        .from('university')
        .delete()
        .eq('id', id);

      if (universityError) {
        if (universityError.code === 'PGRST116') {
          this.logger.warn(`University with id ${id} not found for deletion`);
          throw new Error('University not found');
        }
        this.logger.error('Error deleting university:', universityError);
        throw new Error(`Failed to delete university: ${universityError.message}`);
      }

      this.logger.log(`Successfully deleted university ${id} and all linked programs`);
    } catch (error) {
      this.logger.error('Exception in deleteUniversity:', error);
      throw error;
    }
  }
}

