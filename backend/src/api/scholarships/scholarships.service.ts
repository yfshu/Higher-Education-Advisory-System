import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../supabase/types/supabase.types';

type ScholarshipRow = Database['public']['Tables']['scholarships']['Row'];

export interface ScholarshipWithDetails extends ScholarshipRow {
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

      if (filters?.studyLevel) {
        const levelLower = filters.studyLevel.toLowerCase();
        this.logger.log(`🔍 Filtering scholarships by level: "${levelLower}"`);
        query = query.eq('level', levelLower);
        this.logger.log(`✅ Applied level filter: level = '${levelLower}'`);
      }

      if (filters?.type) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        query = query.eq('type', filters.type as any);
      }

      if (filters?.location) {
        if (filters.location === 'local') {
          query = query
            .ilike('location', '%Malaysia%')
            .not('location', 'ilike', '%Overseas%');
        } else if (filters.location === 'overseas') {
          query = query.ilike('location', '%Overseas%');
        } else if (filters.location === 'both') {
          query = query
            .ilike('location', '%Malaysia%')
            .ilike('location', '%Overseas%');
        } else {
          query = query.ilike('location', `%${filters.location}%`);
        }
      }

      if (filters?.fieldId) {
        query = query.contains('fields_supported', [filters.fieldId]);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('❌ Error fetching scholarships:', error);
        throw new Error(`Failed to fetch scholarships: ${error.message}`);
      }

      this.logger.log(
        `📊 Raw query returned ${data?.length || 0} scholarships`,
      );

      let scholarships = (data || []).map((scholarship) => {
        return this.parseScholarshipData(scholarship);
      });
      if (filters?.studyLevel) {
        const levelLower = filters.studyLevel.toLowerCase();
        const beforeCount = scholarships.length;
        scholarships = scholarships.filter((scholarship) => {
          if (!scholarship.level) {
            this.logger.debug(
              `⚠️ Scholarship ${scholarship.id} has no level, filtering out`,
            );
            return false;
          }
          const matches = scholarship.level.toLowerCase() === levelLower;
          if (!matches) {
            this.logger.debug(
              `⚠️ Scholarship ${scholarship.id} level mismatch: "${scholarship.level}" !== "${levelLower}"`,
            );
          }
          return matches;
        });
        this.logger.log(
          `🎯 Level filter applied: ${beforeCount} -> ${scholarships.length} scholarships (filter: "${levelLower}")`,
        );
      }

      this.logger.log(
        `✅ Successfully fetched ${scholarships.length} scholarships`,
      );
      return scholarships;
    } catch (error) {
      this.logger.error('Exception in getScholarships:', error);
      throw error;
    }
  }

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

  async getScholarshipsByLevel(
    level: 'foundation' | 'diploma' | 'degree',
  ): Promise<ScholarshipWithDetails[]> {
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

      this.logger.log(
        `Successfully fetched ${scholarships.length} scholarships for level ${level}`,
      );
      return scholarships;
    } catch (error) {
      this.logger.error('Exception in getScholarshipsByLevel:', error);
      throw error;
    }
  }

  private parseScholarshipData(scholarship: any): ScholarshipWithDetails {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const parsed: any = {
      ...scholarship,

      provider: scholarship.organization_name || null,

      website_url: scholarship.website_url || null,

      application_url: scholarship.website_url || null,

      eligibility_requirements: scholarship.eligibility_requirements || scholarship.requirements || null,

      contact_email: scholarship.contact_email || null,

      contact_phone: scholarship.contact_phone || null,
    };

    let eligibilityRequirements: string[] | null = null;

    const eligibilityData =
      scholarship.eligibility_requirements ||
      parsed.eligibility_requirements ||
      scholarship.requirements;

    if (eligibilityData) {
      try {
        if (Array.isArray(eligibilityData)) {
          eligibilityRequirements = eligibilityData;
        } else if (typeof eligibilityData === 'string') {
          const parsedJson = JSON.parse(eligibilityData);
          if (Array.isArray(parsedJson)) {
            eligibilityRequirements = parsedJson;
          } else if (typeof parsedJson === 'object' && parsedJson !== null) {
            const reqs: string[] = [];

            if (parsedJson.cgpa) reqs.push(`CGPA: ${parsedJson.cgpa}`);

            if (parsedJson.age_min || parsedJson.age_max) {
              const ageRange =
                parsedJson.age_min && parsedJson.age_max
                  ? `${parsedJson.age_min}-${parsedJson.age_max} years`
                  : parsedJson.age_min
                    ? `Minimum age: ${parsedJson.age_min} years`
                    : `Maximum age: ${parsedJson.age_max} years`;
              reqs.push(`Age: ${ageRange}`);
            }
            eligibilityRequirements =
              reqs.length > 0 ? reqs : [JSON.stringify(parsedJson)];
          } else {
            eligibilityRequirements = [eligibilityData];
          }
        } else if (
          typeof eligibilityData === 'object' &&
          eligibilityData !== null
        ) {
          const reqs: string[] = [];

          if (eligibilityData.cgpa) reqs.push(`CGPA: ${eligibilityData.cgpa}`);

          if (eligibilityData.age_min || eligibilityData.age_max) {
            const ageRange =
              eligibilityData.age_min && eligibilityData.age_max
                ? `${eligibilityData.age_min}-${eligibilityData.age_max} years`
                : eligibilityData.age_min
                  ? `Minimum age: ${eligibilityData.age_min} years`
                  : `Maximum age: ${eligibilityData.age_max} years`;
            reqs.push(`Age: ${ageRange}`);
          }
          eligibilityRequirements =
            reqs.length > 0 ? reqs : [JSON.stringify(eligibilityData)];
        }
      } catch {
        eligibilityRequirements = [String(eligibilityData)];
      }
    }

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
            const benefits: string[] = [];

            if (parsedJson.amount !== null && parsedJson.amount !== undefined) {
              benefits.push(`Amount: RM ${parsedJson.amount.toLocaleString()}`);
            }

            if (parsedJson.accommodation !== undefined) {
              benefits.push(
                `Accommodation: ${parsedJson.accommodation ? 'Included' : 'Not included'}`,
              );
            }
            benefitsJson =
              benefits.length > 0 ? benefits : [JSON.stringify(parsedJson)];
          }
        } else if (typeof benefitsData === 'object' && benefitsData !== null) {
          const benefits: string[] = [];

          if (
            benefitsData.amount !== null &&
            benefitsData.amount !== undefined
          ) {
            benefits.push(`Amount: RM ${benefitsData.amount.toLocaleString()}`);
          }

          if (benefitsData.accommodation !== undefined) {
            benefits.push(
              `Accommodation: ${benefitsData.accommodation ? 'Included' : 'Not included'}`,
            );
          }
          benefitsJson =
            benefits.length > 0 ? benefits : [JSON.stringify(benefitsData)];
        }
      } catch {
        benefitsJson = null;
      }
    }

    let selectionProcess: Array<{
      step: number;
      title: string;
      description: string;
      duration: string;
    }> | null = null;

    const selectionData =
      scholarship.selection_process || parsed.selection_process;
    if (selectionData) {
      try {
        if (Array.isArray(selectionData)) {
          selectionProcess = selectionData;
        } else if (typeof selectionData === 'string') {
          const parsedJson = JSON.parse(selectionData);
          if (Array.isArray(parsedJson)) {
            selectionProcess = parsedJson;
          } else if (
            typeof parsedJson === 'object' &&
            parsedJson !== null &&
            parsedJson.stages
          ) {
            // Handle old format with stages array (from string JSON)
            selectionProcess = parsedJson.stages.map(
              (stage: string, index: number) => {
                const stageTitle = stage
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase());
                
                let description = `Complete ${stageTitle}`;
                // Add interview requirement info if this is the interview stage
                if (stage === 'interview' && parsedJson.interview_required !== undefined) {
                  description += parsedJson.interview_required 
                    ? ' (Interview required)' 
                    : ' (Interview may be required)';
                }
                
                return {
                  step: index + 1,
                  title: stageTitle,
                  description: description,
                  duration: parsedJson.duration_weeks ? `${parsedJson.duration_weeks} weeks` : (parsedJson.duration || 'Not specified'),
                };
              },
            );
          }
        } else if (
          typeof selectionData === 'object' &&
          selectionData !== null
        ) {
          if (Array.isArray(selectionData)) {
            selectionProcess = selectionData;
          } else if (
            selectionData.stages &&
            Array.isArray(selectionData.stages)
          ) {
            // Handle old format with stages array
            selectionProcess = selectionData.stages.map(
              (stage: string, index: number) => {
                const stageTitle = stage
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase());
                
                let description = `Complete ${stageTitle}`;
                // Add interview requirement info if this is the interview stage
                if (stage === 'interview' && selectionData.interview_required !== undefined) {
                  description += selectionData.interview_required 
                    ? ' (Interview required)' 
                    : ' (Interview may be required)';
                }
                
                return {
                  step: index + 1,
                  title: stageTitle,
                  description: description,
                  duration: selectionData.duration_weeks ? `${selectionData.duration_weeks} weeks` : (selectionData.duration || 'Not specified'),
                };
              },
            );
          }
        }
      } catch {
        selectionProcess = null;
      }
    }

    let partnerUniversities: Array<{ name: string; country: string }> | null =
      null;

    const partnerData =
      scholarship.partner_universities || parsed.partner_universities;
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
      } catch {
        partnerUniversities = null;
      }
    }

    const benefits = parsed.benefits || null;

    return {
      ...parsed,
      requirements: undefined,

      organization_name:
        scholarship.organization_name || parsed.organization_name || null,

      website_url: parsed.website_url,

      contact_email: parsed.contact_email,

      contact_phone: parsed.contact_phone,

      level: scholarship.level || parsed.level || null,

      provider: parsed.provider,

      application_url: parsed.application_url,
      // Return raw JSONB data for frontend use
      eligibility_requirements: scholarship.eligibility_requirements || null,
      benefits: benefits,
      benefits_json: scholarship.benefits_json || null,
      // Return parsed selection_process (handles both old format with stages and new format with step array)
      selection_process: selectionProcess || null,
      partner_universities: scholarship.partner_universities || partnerUniversities || null,

      processing_time_weeks:
        scholarship.processing_time_weeks ||
        parsed.processing_time_weeks ||
        null,

      applicant_count:
        scholarship.applicant_count || parsed.applicant_count || null,

      rating: scholarship.rating || parsed.rating || null,

      review_count: scholarship.review_count || parsed.review_count || null,
      study_levels: undefined,
      fields_supported: undefined,
      eligible_programs: undefined,
    };
  }

  async getAllScholarships(
    includeAllStatuses: boolean = false,
  ): Promise<ScholarshipWithDetails[]> {
    try {
      const db = this.supabaseService.getClient();
      const allScholarships: ScholarshipWithDetails[] = [];
      const batchSize = 1000;
      let from = 0;
      let to = batchSize - 1;
      let hasMore = true;
      let iteration = 0;
      const maxIterations = 10;

      this.logger.log(
        `Starting to fetch scholarships${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`,
      );

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
          this.logger.error(
            `Error fetching scholarships batch ${iteration}:`,
            error,
          );
          throw new Error(`Failed to fetch scholarships: ${error.message}`);
        }

        if (data && data.length > 0) {
          const parsed = (data || []).map((scholarship) =>
            this.parseScholarshipData(scholarship),
          );
          allScholarships.push(...parsed);
          from = to + 1;
          to = from + batchSize - 1;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      allScholarships.sort((a, b) => {
        const aDate = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bDate = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aDate - bDate;
      });

      this.logger.log(
        `Successfully fetched ${allScholarships.length} scholarships${includeAllStatuses ? ' (all statuses)' : ' (active only)'}`,
      );
      return allScholarships;
    } catch (error) {
      this.logger.error('Exception in getAllScholarships:', error);
      throw error;
    }
  }

  async createScholarship(
    scholarshipData: any,
  ): Promise<ScholarshipWithDetails> {
    try {
      const db = this.supabaseService.getClient();

      if (!scholarshipData.status) {
        scholarshipData.status = 'active';
      }

      if (scholarshipData.provider !== undefined) {
        scholarshipData.organization_name = scholarshipData.provider;

        delete scholarshipData.provider;
      }

      if (scholarshipData.application_url !== undefined) {
        scholarshipData.website_url = scholarshipData.application_url;

        delete scholarshipData.application_url;
      }

      // Store eligibility_requirements directly in JSONB column
      if (scholarshipData.eligibility_requirements !== undefined) {
        if (
          typeof scholarshipData.eligibility_requirements === 'object' &&
          scholarshipData.eligibility_requirements !== null
        ) {
          // Keep as object for JSONB storage
          // Don't convert to requirements text field
        } else if (
          typeof scholarshipData.eligibility_requirements === 'string'
        ) {
          // Try to parse string to object
          try {
            scholarshipData.eligibility_requirements = JSON.parse(scholarshipData.eligibility_requirements);
          } catch {
            // If not valid JSON, convert to object
            scholarshipData.eligibility_requirements = { requirements: scholarshipData.eligibility_requirements };
          }
        }
      }
      // Always explicitly set requirements to null to prevent storing in old text field
      // IMPORTANT: Never store in requirements - only use eligibility_requirements JSONB column
      scholarshipData.requirements = null;

      // Store benefits_json directly in JSONB column
      if (scholarshipData.benefits_json !== undefined) {
        if (
          typeof scholarshipData.benefits_json === 'object' &&
          scholarshipData.benefits_json !== null
        ) {
          // Keep as object for JSONB storage
        } else if (typeof scholarshipData.benefits_json === 'string') {
          // Try to parse string to object
          try {
            scholarshipData.benefits_json = JSON.parse(scholarshipData.benefits_json);
          } catch {
            // If not valid JSON, convert to object
            scholarshipData.benefits_json = { benefits: scholarshipData.benefits_json };
          }
        }
        // Remove old benefits text field if it exists
        delete scholarshipData.benefits;
      }

      // Handle legacy benefits field for backward compatibility (convert to benefits_json)
      if (scholarshipData.benefits !== undefined && scholarshipData.benefits_json === undefined) {
        if (typeof scholarshipData.benefits === 'string') {
          try {
            scholarshipData.benefits_json = JSON.parse(scholarshipData.benefits);
          } catch {
            scholarshipData.benefits_json = { benefits: scholarshipData.benefits };
          }
        } else if (typeof scholarshipData.benefits === 'object' && scholarshipData.benefits !== null) {
          scholarshipData.benefits_json = scholarshipData.benefits;
        }
        delete scholarshipData.benefits;
      }

      delete scholarshipData.study_levels;

      delete scholarshipData.fields_supported;

      delete scholarshipData.eligible_programs;

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

  async updateScholarship(
    id: number,
    scholarshipData: any,
  ): Promise<ScholarshipWithDetails> {
    try {
      const db = this.supabaseService.getClient();

      if (scholarshipData.provider !== undefined) {
        scholarshipData.organization_name = scholarshipData.provider;

        delete scholarshipData.provider;
      }

      if (scholarshipData.application_url !== undefined) {
        scholarshipData.website_url = scholarshipData.application_url;

        delete scholarshipData.application_url;
      }

      // Store eligibility_requirements directly in JSONB column
      if (scholarshipData.eligibility_requirements !== undefined) {
        if (
          typeof scholarshipData.eligibility_requirements === 'object' &&
          scholarshipData.eligibility_requirements !== null
        ) {
          // Keep as object for JSONB storage
          // Don't convert to requirements text field
        } else if (
          typeof scholarshipData.eligibility_requirements === 'string'
        ) {
          // Try to parse string to object
          try {
            scholarshipData.eligibility_requirements = JSON.parse(scholarshipData.eligibility_requirements);
          } catch {
            // If not valid JSON, convert to object
            scholarshipData.eligibility_requirements = { requirements: scholarshipData.eligibility_requirements };
          }
        }
      }
      // Always explicitly set requirements to null to prevent storing in old text field
      // IMPORTANT: Never store in requirements - only use eligibility_requirements JSONB column
      scholarshipData.requirements = null;

      // Store benefits_json directly in JSONB column
      if (scholarshipData.benefits_json !== undefined) {
        if (
          typeof scholarshipData.benefits_json === 'object' &&
          scholarshipData.benefits_json !== null
        ) {
          // Keep as object for JSONB storage
        } else if (typeof scholarshipData.benefits_json === 'string') {
          // Try to parse string to object
          try {
            scholarshipData.benefits_json = JSON.parse(scholarshipData.benefits_json);
          } catch {
            // If not valid JSON, convert to object
            scholarshipData.benefits_json = { benefits: scholarshipData.benefits_json };
          }
        }
        // Remove old benefits text field if it exists
        delete scholarshipData.benefits;
      }

      // Handle legacy benefits field for backward compatibility (convert to benefits_json)
      if (scholarshipData.benefits !== undefined && scholarshipData.benefits_json === undefined) {
        if (typeof scholarshipData.benefits === 'string') {
          try {
            scholarshipData.benefits_json = JSON.parse(scholarshipData.benefits);
          } catch {
            scholarshipData.benefits_json = { benefits: scholarshipData.benefits };
          }
        } else if (typeof scholarshipData.benefits === 'object' && scholarshipData.benefits !== null) {
          scholarshipData.benefits_json = scholarshipData.benefits;
        }
        delete scholarshipData.benefits;
      }

      delete scholarshipData.study_levels;

      delete scholarshipData.fields_supported;

      delete scholarshipData.eligible_programs;

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

  async deleteScholarship(id: number): Promise<void> {
    try {
      const db = this.supabaseService.getClient();

      const { error } = await db.from('scholarships').delete().eq('id', id);

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
