import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';

type ScholarshipRow = Database['public']['Tables']['scholarships']['Row'];

export interface ScholarshipWithDetails extends ScholarshipRow {
  // Extended interface for structured JSON fields
  eligibility_requirements?: string[] | null;
  benefits_json?: string[] | null;
  selection_process?: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }> | null;
  partner_universities?: Array<{
    name: string;
    country: string;
  }> | null;
}

@Injectable()
export class ScholarshipsService {
  private readonly logger = new Logger(ScholarshipsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all active scholarships with structured data
   */
  async getScholarships(filters?: {
    studyLevel?: string;
    type?: string;
    location?: string;
    fieldId?: number;
  }): Promise<ScholarshipWithDetails[]> {
    try {
      const db = this.supabaseService.getClient();

      let query = db
        .from('scholarships')
        .select('*')
        .eq('status', 'active')
        .order('deadline', { ascending: true });

      // Apply filters
      if (filters?.studyLevel) {
        query = query.contains('study_levels', [filters.studyLevel]);
      }

      if (filters?.type) {
        // Type assertion needed for enum type
        query = query.eq('type', filters.type as any);
      }

      if (filters?.location) {
        // Location filter: check if location contains the filter value
        if (filters.location === 'local') {
          query = query.ilike('location', '%Malaysia%').not('location', 'ilike', '%Overseas%');
        } else if (filters.location === 'overseas') {
          query = query.ilike('location', '%Overseas%');
        } else if (filters.location === 'both') {
          query = query.ilike('location', '%Malaysia%').ilike('location', '%Overseas%');
        } else {
          query = query.ilike('location', `%${filters.location}%`);
        }
      }

      if (filters?.fieldId) {
        query = query.contains('fields_supported', [filters.fieldId]);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching scholarships:', error);
        throw new Error(`Failed to fetch scholarships: ${error.message}`);
      }

      // Parse JSONB fields
      const scholarships = (data || []).map((scholarship) => {
        return this.parseScholarshipData(scholarship);
      });

      this.logger.log(`Successfully fetched ${scholarships.length} scholarships`);
      return scholarships;
    } catch (error) {
      this.logger.error('Exception in getScholarships:', error);
      throw error;
    }
  }

  /**
   * Get scholarship by ID with structured data
   */
  async getScholarshipById(id: number): Promise<ScholarshipWithDetails | null> {
    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          this.logger.warn(`Scholarship with id ${id} not found`);
          return null;
        }
        this.logger.error('Error fetching scholarship:', error);
        throw new Error(`Failed to fetch scholarship: ${error.message}`);
      }

      const scholarship = this.parseScholarshipData(data);
      this.logger.log(`Successfully fetched scholarship ${id}`);
      return scholarship;
    } catch (error) {
      this.logger.error('Exception in getScholarshipById:', error);
      throw error;
    }
  }

  /**
   * Get scholarships by study level
   */
  async getScholarshipsByLevel(level: 'foundation' | 'diploma' | 'degree'): Promise<ScholarshipWithDetails[]> {
    try {
      const db = this.supabaseService.getClient();

      const { data, error } = await db
        .from('scholarships')
        .select('*')
        .eq('status', 'active')
        .contains('study_levels', [level])
        .order('deadline', { ascending: true });

      if (error) {
        this.logger.error('Error fetching scholarships by level:', error);
        throw new Error(`Failed to fetch scholarships: ${error.message}`);
      }

      const scholarships = (data || []).map((scholarship) => {
        return this.parseScholarshipData(scholarship);
      });

      this.logger.log(`Successfully fetched ${scholarships.length} scholarships for level ${level}`);
      return scholarships;
    } catch (error) {
      this.logger.error('Exception in getScholarshipsByLevel:', error);
      throw error;
    }
  }

  /**
   * Parse scholarship data and convert JSONB fields to proper types
   */
  private parseScholarshipData(scholarship: any): ScholarshipWithDetails {
    // Parse eligibility_requirements JSONB to array
    let eligibilityRequirements: string[] | null = null;
    if (scholarship.eligibility_requirements) {
      try {
        if (Array.isArray(scholarship.eligibility_requirements)) {
          eligibilityRequirements = scholarship.eligibility_requirements;
        } else if (typeof scholarship.eligibility_requirements === 'string') {
          eligibilityRequirements = JSON.parse(scholarship.eligibility_requirements);
        }
      } catch (e) {
        this.logger.warn(`Failed to parse eligibility_requirements for scholarship ${scholarship.id}`);
      }
    }

    // Parse benefits_json JSONB to array
    let benefitsJson: string[] | null = null;
    if (scholarship.benefits_json) {
      try {
        if (Array.isArray(scholarship.benefits_json)) {
          benefitsJson = scholarship.benefits_json;
        } else if (typeof scholarship.benefits_json === 'string') {
          benefitsJson = JSON.parse(scholarship.benefits_json);
        }
      } catch (e) {
        this.logger.warn(`Failed to parse benefits_json for scholarship ${scholarship.id}`);
      }
    }

    // Parse selection_process JSONB to array of objects
    let selectionProcess: Array<{
      step: number;
      title: string;
      description: string;
      duration: string;
    }> | null = null;
    if (scholarship.selection_process) {
      try {
        if (Array.isArray(scholarship.selection_process)) {
          selectionProcess = scholarship.selection_process;
        } else if (typeof scholarship.selection_process === 'string') {
          selectionProcess = JSON.parse(scholarship.selection_process);
        }
      } catch (e) {
        this.logger.warn(`Failed to parse selection_process for scholarship ${scholarship.id}`);
      }
    }

    // Parse partner_universities JSONB to array of objects
    let partnerUniversities: Array<{
      name: string;
      country: string;
    }> | null = null;
    if (scholarship.partner_universities) {
      try {
        if (Array.isArray(scholarship.partner_universities)) {
          partnerUniversities = scholarship.partner_universities;
        } else if (typeof scholarship.partner_universities === 'string') {
          partnerUniversities = JSON.parse(scholarship.partner_universities);
        }
      } catch (e) {
        this.logger.warn(`Failed to parse partner_universities for scholarship ${scholarship.id}`);
      }
    }

    return {
      ...scholarship,
      eligibility_requirements: eligibilityRequirements,
      benefits_json: benefitsJson,
      selection_process: selectionProcess,
      partner_universities: partnerUniversities,
    };
  }
}

