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
        // Filter by level field (lowercase: foundation, diploma, degree)
        query = query.eq('level', filters.studyLevel.toLowerCase());
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
        .eq('level', level.toLowerCase())
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
   * Parse scholarship data and convert database fields to frontend-friendly format
   */
  private parseScholarshipData(scholarship: any): ScholarshipWithDetails {
    // Map database column names to frontend field names
    const parsed: any = {
      ...scholarship,
      // Map organization_name to provider for frontend compatibility
      provider: scholarship.organization_name || null,
      // Keep website_url for contact information display
      website_url: scholarship.website_url || null,
      // Map website_url to application_url for frontend compatibility (legacy support)
      application_url: scholarship.website_url || null,
      // Map requirements to eligibility_requirements for frontend compatibility
      eligibility_requirements: scholarship.requirements || null,
      // Keep contact fields for contact information display
      contact_email: scholarship.contact_email || null,
      contact_phone: scholarship.contact_phone || null,
    };

    // Parse eligibility_requirements (can be JSONB object or string)
    let eligibilityRequirements: string[] | null = null;
    const eligibilityData = scholarship.eligibility_requirements || parsed.eligibility_requirements || scholarship.requirements;
    
    if (eligibilityData) {
      try {
        if (Array.isArray(eligibilityData)) {
          eligibilityRequirements = eligibilityData;
        } else if (typeof eligibilityData === 'string') {
          const parsedJson = JSON.parse(eligibilityData);
          if (Array.isArray(parsedJson)) {
            eligibilityRequirements = parsedJson;
          } else if (typeof parsedJson === 'object' && parsedJson !== null) {
            // Convert object to array of formatted strings
            const reqs: string[] = [];
            if (parsedJson.cgpa) reqs.push(`CGPA: ${parsedJson.cgpa}`);
            if (parsedJson.age_min || parsedJson.age_max) {
              const ageRange = parsedJson.age_min && parsedJson.age_max 
                ? `${parsedJson.age_min}-${parsedJson.age_max} years`
                : parsedJson.age_min 
                ? `Minimum age: ${parsedJson.age_min} years`
                : `Maximum age: ${parsedJson.age_max} years`;
              reqs.push(`Age: ${ageRange}`);
            }
            eligibilityRequirements = reqs.length > 0 ? reqs : [JSON.stringify(parsedJson)];
          } else {
            eligibilityRequirements = [eligibilityData];
          }
        } else if (typeof eligibilityData === 'object' && eligibilityData !== null) {
          // Already an object (JSONB)
          const reqs: string[] = [];
          if (eligibilityData.cgpa) reqs.push(`CGPA: ${eligibilityData.cgpa}`);
          if (eligibilityData.age_min || eligibilityData.age_max) {
            const ageRange = eligibilityData.age_min && eligibilityData.age_max 
              ? `${eligibilityData.age_min}-${eligibilityData.age_max} years`
              : eligibilityData.age_min 
              ? `Minimum age: ${eligibilityData.age_min} years`
              : `Maximum age: ${eligibilityData.age_max} years`;
            reqs.push(`Age: ${ageRange}`);
          }
          eligibilityRequirements = reqs.length > 0 ? reqs : [JSON.stringify(eligibilityData)];
        }
      } catch (e) {
        // If parsing fails, treat as plain text
        eligibilityRequirements = [String(eligibilityData)];
      }
    }

    // Parse benefits_json (JSONB field)
    let benefitsJson: string[] | null = null;
    const benefitsData = scholarship.benefits_json || parsed.benefits_json;
    if (benefitsData) {
      try {
        if (Array.isArray(benefitsData)) {
          benefitsJson = benefitsData;
        } else if (typeof benefitsData === 'string') {
          const parsedJson = JSON.parse(benefitsData);
          if (Array.isArray(parsedJson)) {
            benefitsJson = parsedJson;
          } else if (typeof parsedJson === 'object' && parsedJson !== null) {
            // Convert object to array of formatted strings
            const benefits: string[] = [];
            if (parsedJson.amount !== null && parsedJson.amount !== undefined) {
              benefits.push(`Amount: RM ${parsedJson.amount.toLocaleString()}`);
            }
            if (parsedJson.accommodation !== undefined) {
              benefits.push(`Accommodation: ${parsedJson.accommodation ? 'Included' : 'Not included'}`);
            }
            benefitsJson = benefits.length > 0 ? benefits : [JSON.stringify(parsedJson)];
          }
        } else if (typeof benefitsData === 'object' && benefitsData !== null) {
          // Already an object (JSONB)
          const benefits: string[] = [];
          if (benefitsData.amount !== null && benefitsData.amount !== undefined) {
            benefits.push(`Amount: RM ${benefitsData.amount.toLocaleString()}`);
          }
          if (benefitsData.accommodation !== undefined) {
            benefits.push(`Accommodation: ${benefitsData.accommodation ? 'Included' : 'Not included'}`);
          }
          benefitsJson = benefits.length > 0 ? benefits : [JSON.stringify(benefitsData)];
        }
      } catch (e) {
        benefitsJson = null;
      }
    }

    // Parse selection_process (JSONB field)
    let selectionProcess: Array<{ step: number; title: string; description: string; duration: string }> | null = null;
    const selectionData = scholarship.selection_process || parsed.selection_process;
    if (selectionData) {
      try {
        if (Array.isArray(selectionData)) {
          selectionProcess = selectionData;
        } else if (typeof selectionData === 'string') {
          const parsedJson = JSON.parse(selectionData);
          if (Array.isArray(parsedJson)) {
            selectionProcess = parsedJson;
          } else if (typeof parsedJson === 'object' && parsedJson !== null && parsedJson.stages) {
            // Convert stages array to step format
            selectionProcess = parsedJson.stages.map((stage: string, index: number) => ({
              step: index + 1,
              title: stage.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              description: `Complete ${stage.replace(/_/g, ' ')}`,
              duration: parsedJson.duration || 'Not specified',
            }));
          }
        } else if (typeof selectionData === 'object' && selectionData !== null) {
          // Already an object (JSONB)
          if (Array.isArray(selectionData)) {
            selectionProcess = selectionData;
          } else if (selectionData.stages && Array.isArray(selectionData.stages)) {
            selectionProcess = selectionData.stages.map((stage: string, index: number) => ({
              step: index + 1,
              title: stage.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              description: `Complete ${stage.replace(/_/g, ' ')}`,
              duration: selectionData.duration || 'Not specified',
            }));
          }
        }
      } catch (e) {
        selectionProcess = null;
      }
    }

    // Parse partner_universities (JSONB field)
    let partnerUniversities: Array<{ name: string; country: string }> | null = null;
    const partnerData = scholarship.partner_universities || parsed.partner_universities;
    if (partnerData) {
      try {
        if (Array.isArray(partnerData)) {
          partnerUniversities = partnerData;
        } else if (typeof partnerData === 'string') {
          const parsedJson = JSON.parse(partnerData);
          if (Array.isArray(parsedJson)) {
            partnerUniversities = parsedJson;
          }
        }
      } catch (e) {
        partnerUniversities = null;
      }
    }

    // Benefits is already a string in the database, keep it as is
    const benefits = parsed.benefits || null;

    return {
      ...parsed,
      // Remove database-specific fields that don't exist in frontend interface
      requirements: undefined,
      // Keep organization_name from database
      organization_name: scholarship.organization_name || parsed.organization_name || null,
      // Keep website_url, contact_email, contact_phone for contact information display
      website_url: parsed.website_url,
      contact_email: parsed.contact_email,
      contact_phone: parsed.contact_phone,
      // Keep level field from database
      level: scholarship.level || parsed.level || null,
      // Map to frontend-friendly fields
      provider: parsed.provider,
      application_url: parsed.application_url,
      eligibility_requirements: eligibilityRequirements || null,
      benefits: benefits,
      // Keep JSONB fields for tabs
      benefits_json: benefitsJson || null,
      selection_process: selectionProcess || null,
      partner_universities: partnerUniversities || null,
      // Keep processing_time_weeks from database
      processing_time_weeks: scholarship.processing_time_weeks || parsed.processing_time_weeks || null,
      // Keep applicant_count, rating, review_count from database
      applicant_count: scholarship.applicant_count || parsed.applicant_count || null,
      rating: scholarship.rating || parsed.rating || null,
      review_count: scholarship.review_count || parsed.review_count || null,
      // Remove fields that don't exist in database
      study_levels: undefined,
      fields_supported: undefined,
      eligible_programs: undefined,
    };
  }

  /**
   * Get all scholarships (including inactive) for admin
   */
  async getAllScholarships(includeAllStatuses: boolean = false): Promise<ScholarshipWithDetails[]> {
    try {
      const db = this.supabaseService.getClient();
      const allScholarships: ScholarshipWithDetails[] = [];
      const batchSize = 1000;
      let from = 0;
      let to = batchSize - 1;
      let hasMore = true;
      let iteration = 0;
      const maxIterations = 10;

      this.logger.log(`Starting to fetch scholarships${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`);

      while (hasMore && iteration < maxIterations) {
        iteration++;
        let query = db
          .from('scholarships')
          .select('*')
          .order('id', { ascending: true })
          .range(from, to);

        if (!includeAllStatuses) {
          query = query.eq('status', 'active');
        }

        const { data, error } = await query;

        if (error) {
          this.logger.error(`Error fetching scholarships batch ${iteration}:`, error);
          throw new Error(`Failed to fetch scholarships: ${error.message}`);
        }

        if (data && data.length > 0) {
          const parsed = (data || []).map((scholarship) => this.parseScholarshipData(scholarship));
          allScholarships.push(...parsed);
          from = to + 1;
          to = from + batchSize - 1;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      // Sort by deadline ascending
      allScholarships.sort((a, b) => {
        const aDate = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bDate = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aDate - bDate;
      });

      this.logger.log(`Successfully fetched ${allScholarships.length} scholarships${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`);
      return allScholarships;
    } catch (error) {
      this.logger.error('Exception in getAllScholarships:', error);
      throw error;
    }
  }

  /**
   * Create a new scholarship
   */
  async createScholarship(scholarshipData: any): Promise<ScholarshipWithDetails> {
    try {
      const db = this.supabaseService.getClient();

      // Ensure status defaults to 'active' if not provided
      if (!scholarshipData.status) {
        scholarshipData.status = 'active';
      }

      // Map frontend field names to database column names
      if (scholarshipData.provider !== undefined) {
        scholarshipData.organization_name = scholarshipData.provider;
        delete scholarshipData.provider;
      }
      if (scholarshipData.application_url !== undefined) {
        scholarshipData.website_url = scholarshipData.application_url;
        delete scholarshipData.application_url;
      }
      if (scholarshipData.eligibility_requirements !== undefined) {
        // Convert object to string for requirements field
        if (typeof scholarshipData.eligibility_requirements === 'object' && scholarshipData.eligibility_requirements !== null) {
          scholarshipData.requirements = JSON.stringify(scholarshipData.eligibility_requirements);
        } else if (typeof scholarshipData.eligibility_requirements === 'string') {
          scholarshipData.requirements = scholarshipData.eligibility_requirements;
        }
        delete scholarshipData.eligibility_requirements;
      }
      // Ensure benefits is always a string (not an object)
      if (scholarshipData.benefits !== undefined) {
        if (typeof scholarshipData.benefits !== 'string') {
          if (typeof scholarshipData.benefits === 'object' && scholarshipData.benefits !== null) {
            scholarshipData.benefits = JSON.stringify(scholarshipData.benefits);
          } else {
            scholarshipData.benefits = scholarshipData.benefits ? String(scholarshipData.benefits) : null;
          }
        }
      }
      // Remove fields that don't exist in the database
      delete scholarshipData.study_levels;
      delete scholarshipData.fields_supported;
      delete scholarshipData.eligible_programs;
      delete scholarshipData.processing_time_weeks;
      delete scholarshipData.applicant_count;
      delete scholarshipData.rating;
      delete scholarshipData.review_count;
      delete scholarshipData.selection_process;
      delete scholarshipData.partner_universities;

      const { data, error } = await db
        .from('scholarships')
        .insert(scholarshipData)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating scholarship:', error);
        throw new Error(`Failed to create scholarship: ${error.message}`);
      }

      const scholarship = this.parseScholarshipData(data);
      this.logger.log(`Successfully created scholarship: ${data.id}`);
      return scholarship;
    } catch (error) {
      this.logger.error('Exception in createScholarship:', error);
      throw error;
    }
  }

  /**
   * Update an existing scholarship
   */
  async updateScholarship(id: number, scholarshipData: any): Promise<ScholarshipWithDetails> {
    try {
      const db = this.supabaseService.getClient();

      // Map frontend field names to database column names
      if (scholarshipData.provider !== undefined) {
        scholarshipData.organization_name = scholarshipData.provider;
        delete scholarshipData.provider;
      }
      if (scholarshipData.application_url !== undefined) {
        scholarshipData.website_url = scholarshipData.application_url;
        delete scholarshipData.application_url;
      }
      if (scholarshipData.eligibility_requirements !== undefined) {
        // Convert object to string for requirements field
        if (typeof scholarshipData.eligibility_requirements === 'object' && scholarshipData.eligibility_requirements !== null) {
          scholarshipData.requirements = JSON.stringify(scholarshipData.eligibility_requirements);
        } else if (typeof scholarshipData.eligibility_requirements === 'string') {
          scholarshipData.requirements = scholarshipData.eligibility_requirements;
        }
        delete scholarshipData.eligibility_requirements;
      }
      // Ensure benefits is always a string (not an object)
      if (scholarshipData.benefits !== undefined) {
        if (typeof scholarshipData.benefits !== 'string') {
          if (typeof scholarshipData.benefits === 'object' && scholarshipData.benefits !== null) {
            scholarshipData.benefits = JSON.stringify(scholarshipData.benefits);
          } else {
            scholarshipData.benefits = scholarshipData.benefits ? String(scholarshipData.benefits) : null;
          }
        }
      }
      // Remove fields that don't exist in the database
      delete scholarshipData.study_levels;
      delete scholarshipData.fields_supported;
      delete scholarshipData.eligible_programs;
      delete scholarshipData.processing_time_weeks;
      delete scholarshipData.applicant_count;
      delete scholarshipData.rating;
      delete scholarshipData.review_count;
      delete scholarshipData.selection_process;
      delete scholarshipData.partner_universities;

      // Add updated_at timestamp
      scholarshipData.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('scholarships')
        .update(scholarshipData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Scholarship with id ${id} not found for update`);
          throw new Error('Scholarship not found');
        }
        this.logger.error('Error updating scholarship:', error);
        throw new Error(`Failed to update scholarship: ${error.message}`);
      }

      const scholarship = this.parseScholarshipData(data);
      this.logger.log(`Successfully updated scholarship: ${id}`);
      return scholarship;
    } catch (error) {
      this.logger.error('Exception in updateScholarship:', error);
      throw error;
    }
  }

  /**
   * Delete a scholarship (hard delete)
   */
  async deleteScholarship(id: number): Promise<void> {
    try {
      const db = this.supabaseService.getClient();

      const { error } = await db
        .from('scholarships')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Scholarship with id ${id} not found for deletion`);
          throw new Error('Scholarship not found');
        }
        this.logger.error('Error deleting scholarship:', error);
        throw new Error(`Failed to delete scholarship: ${error.message}`);
      }

      this.logger.log(`Successfully deleted scholarship: ${id}`);
    } catch (error) {
      this.logger.error('Exception in deleteScholarship:', error);
      throw error;
    }
  }
}

