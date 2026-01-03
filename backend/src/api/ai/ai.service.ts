import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAI } from 'openai';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { SupabaseService } from '../../supabase/supabase.service';
import { ProgramsService } from '../programs/programs.service';
import { AIRecommendationRequestDto } from './dto/ai-recommendation-request.dto';
import { AIRecommendationResponseDto } from './dto/ai-recommendation-response.dto';
import { FinalRecommendationResponseDto, FinalRecommendationDto } from './dto/final-recommendation-response.dto';
import { FieldRecommendationResponseDto } from './dto/field-recommendation-response.dto';
import { ProgramsByFieldRequestDto } from './dto/programs-by-field-request.dto';

interface StudentProfileData {
  studyLevel?: string;
  fieldIds?: number[];
  cgpa?: number;
  budget?: number;
  preferredStates?: string[];
}

import { ProgramWithUniversity } from '../programs/programs.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServiceUrl: string;
  private readonly httpClient: AxiosInstance;
  private readonly openai: OpenAI | null = null;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly programsService: ProgramsService,
  ) {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    // Initialize HTTP client for Python AI service
    this.httpClient = axios.create({
      baseURL: this.aiServiceUrl,
      timeout: this.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize OpenAI client
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI client initialized for AI recommendations');
    } else {
      this.logger.warn('OPENAI_API_KEY not found - OpenAI validation will be unavailable');
    }
  }

  /**
   * STEP 1: Get field-level recommendations only
   * Returns ranked field categories based on student profile
   */
  async getFieldRecommendations(
    userId: string,
    accessToken: string,
  ): Promise<FieldRecommendationResponseDto> {
    try {
      // 1. Fetch student profile
      const { profile } = await this.fetchStudentData(userId, accessToken);

      if (!profile) {
        this.logger.warn('No student profile found - returning empty field recommendations');
        return {
          fields: [],
          powered_by: [],
        };
      }

      // 2. Predict field interests using ML model
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[STEP 1] Field Interest Scoring');
      this.logger.log('═══════════════════════════════════════════════════════════');

      const fieldPredictions = await this.predictFieldInterests(profile);

      this.logger.log(`Field predictions received: ${fieldPredictions.length} fields (after filtering to database fields with programs)`);
      
      if (fieldPredictions.length === 0) {
        this.logger.warn('No fields found with programs in database after ML prediction');
        return {
          fields: [],
          powered_by: ['ML Model'],
        };
      }
      
      // Return only top 5 fields
      let top5Fields = fieldPredictions.slice(0, 5);
      
      // Ensure we have exactly 5 fields (pad with dummy if needed, but this shouldn't happen)
      if (top5Fields.length < 5) {
        this.logger.warn(`Only ${top5Fields.length} fields available, expected 5`);
      }
      
      // Log RAW probabilities from ML model BEFORE normalization
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[DEBUG] RAW ML Model Probabilities (Before Normalization):');
      this.logger.log('═══════════════════════════════════════════════════════════');
      top5Fields.forEach((pred, idx) => {
        const rawPercent = (pred.probability * 100).toFixed(4);
        this.logger.log(`  ${idx + 1}. ${pred.field_name}: ${rawPercent}% (raw)`);
      });
      const totalRaw = top5Fields.reduce((sum, f) => sum + f.probability, 0);
      this.logger.log(`  Total raw probability: ${(totalRaw * 100).toFixed(4)}%`);
      this.logger.log('═══════════════════════════════════════════════════════════');
      
      // Check if Computer Science & IT is in the top 5
      const csField = top5Fields.find(f => f.field_name === 'Computer Science & IT');
      if (csField) {
        this.logger.log(`[DEBUG] Computer Science & IT found at position ${top5Fields.indexOf(csField) + 1} with raw probability: ${(csField.probability * 100).toFixed(4)}%`);
      } else {
        this.logger.warn(`[DEBUG] Computer Science & IT NOT in top 5 fields!`);
        this.logger.warn(`[DEBUG] Top 5 fields are: ${top5Fields.map(f => f.field_name).join(', ')}`);
      }
      
      // STEP 2: OpenAI Validation and Refinement
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[STEP 2] OpenAI Validation of Field Predictions');
      this.logger.log('═══════════════════════════════════════════════════════════');
      
      let validatedFields = top5Fields;
      let poweredBy = ['ML Model'];
      
      try {
        const { preferences } = await this.fetchStudentData(userId, accessToken);
        validatedFields = await this.validateFieldsWithOpenAI(profile, preferences, top5Fields);
        poweredBy = ['ML Model', 'OpenAI Validation'];
        this.logger.log('✅ OpenAI validation completed successfully');
        this.logger.log(`Validated fields: ${validatedFields.map(f => `${f.field_name} (${(f.probability * 100).toFixed(2)}%)`).join(', ')}`);
      } catch (error: any) {
        this.logger.warn('⚠️ OpenAI validation failed, using ML model results only:', error.message);
        this.logger.warn('Falling back to ML model predictions without OpenAI validation');
        // Continue with ML model results
      }
      
      // Normalize probabilities so they sum to 100% and no field has 0%
      // Strategy: 
      // 1. Set minimum probability to 1% for each field
      // 2. Normalize remaining probability (95%) proportionally
      const MIN_PERCENTAGE = 0.01; // 1% minimum
      const REMAINING_PERCENTAGE = 1.0 - (MIN_PERCENTAGE * top5Fields.length); // Remaining after minimums
      
      // Calculate total probability of top 5 for proportional distribution
      const totalProbability = top5Fields.reduce((sum, f) => sum + f.probability, 0);
      
      // Normalize: assign minimum 1% to each, then distribute remaining proportionally
      const normalizedFields = top5Fields.map(field => {
        // Proportional share of remaining percentage (after minimums)
        const proportionalShare = totalProbability > 0 
          ? (field.probability / totalProbability) * REMAINING_PERCENTAGE
          : REMAINING_PERCENTAGE / top5Fields.length;
        
        // Final probability = minimum + proportional share
        const normalizedProb = MIN_PERCENTAGE + proportionalShare;
        
        return {
          field_name: field.field_name,
          probability: normalizedProb,
        };
      });
      
      // Log normalized percentages with comparison to raw
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[DEBUG] NORMALIZED Probabilities (After Normalization):');
      this.logger.log('═══════════════════════════════════════════════════════════');
      normalizedFields.forEach((pred, idx) => {
        const originalField = validatedFields[idx];
        const rawPercent = (originalField.probability * 100).toFixed(4);
        const normalizedPercent = (pred.probability * 100).toFixed(2);
        const change = ((pred.probability - originalField.probability) * 100).toFixed(2);
        this.logger.log(`  ${idx + 1}. ${pred.field_name}: ${normalizedPercent}% (was ${rawPercent}%, change: ${change}%)`);
      });
      
      // Verify sum is 100% (with small tolerance for floating point)
      const sum = normalizedFields.reduce((s, f) => s + f.probability, 0);
      this.logger.log(`Total normalized percentage: ${(sum * 100).toFixed(2)}%`);
      this.logger.log('═══════════════════════════════════════════════════════════');
      
      if (Math.abs(sum - 1.0) > 0.01) {
        this.logger.warn(`Warning: Normalized percentages sum to ${(sum * 100).toFixed(2)}%, not 100%`);
      }
      
      // Special debug for Computer Science & IT
      const csNormalized = normalizedFields.find(f => f.field_name === 'Computer Science & IT');
      if (csNormalized) {
        const csOriginal = validatedFields.find(f => f.field_name === 'Computer Science & IT');
        this.logger.log(`[DEBUG] Computer Science & IT: ${(csNormalized.probability * 100).toFixed(2)}% normalized (from ${(csOriginal!.probability * 100).toFixed(4)}% raw)`);
        this.logger.log(`[DEBUG] This is ${((csNormalized.probability / totalProbability) * 100).toFixed(2)}% of the total raw probability`);
      }

      // Final response logging
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[FINAL RESPONSE] Field recommendations being sent to frontend');
      this.logger.log('═══════════════════════════════════════════════════════════');
      normalizedFields.forEach((f, idx) => {
        this.logger.log(`  ${idx + 1}. ${f.field_name}: ${f.probability} (${(f.probability * 100).toFixed(2)}%)`);
      });
      this.logger.log(`Total fields: ${normalizedFields.length}`);
      this.logger.log(`Response JSON: ${JSON.stringify({ fields: normalizedFields, powered_by: poweredBy }, null, 2)}`);
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Save recommendations to database
      try {
        const sessionId = await this.saveFieldRecommendations(userId, normalizedFields, validatedFields, top5Fields, poweredBy);
        this.logger.log(`✅ Field recommendations saved to database (session_id: ${sessionId})`);
      } catch (saveError: any) {
        this.logger.warn('⚠️ Failed to save field recommendations to database:', saveError.message);
        // Don't fail the request if saving fails
      }

      return {
        fields: normalizedFields,
        powered_by: poweredBy,
      };
    } catch (error) {
      this.logger.error('Error generating field recommendations:', error);
      this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      this.logger.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Provide more specific error messages
      if (error instanceof HttpException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to generate field recommendations: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * STEP 2: Get top 3 programs for a selected field
   * Uses OpenAI to analyze and select the most suitable programs
   */
  async getProgramsByField(
    userId: string,
    accessToken: string,
    fieldName: string,
  ): Promise<FinalRecommendationResponseDto> {
    try {
      // 1. Fetch student profile and preferences
      const { profile, preferences } = await this.fetchStudentData(userId, accessToken);

      if (!profile) {
        this.logger.warn('No student profile found');
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // 2. Map field name to field ID
      this.logger.log(`═══════════════════════════════════════════════════════════`);
      this.logger.log(`[FIELD MAPPING] Mapping field name to ID`);
      this.logger.log(`Field name received: "${fieldName}"`);
      
      const fieldIds = await this.mapFieldNamesToIds([fieldName]);
      if (fieldIds.length === 0) {
        this.logger.error(`❌ No field ID found for field name: "${fieldName}"`);
        this.logger.error(`This might be a field name mismatch. Available fields should match database field_of_interest table.`);
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      const fieldId = fieldIds[0];
      this.logger.log(`✅ Field "${fieldName}" mapped to field ID: ${fieldId}`);

      // 3. Fetch programs filtered by field
      this.logger.log(`[PROGRAM FETCH] Fetching programs for field ID ${fieldId}`);
      const allPrograms = await this.programsService.getPrograms(false);
      this.logger.log(`Total programs in database: ${allPrograms.length}`);
      
      const filteredPrograms = allPrograms.filter(p => p.field_id === fieldId);
      this.logger.log(`✅ Found ${filteredPrograms.length} programs in field "${fieldName}" (field_id: ${fieldId})`);
      
      if (filteredPrograms.length > 0) {
        this.logger.log(`Sample program IDs: ${filteredPrograms.slice(0, 5).map(p => p.id).join(', ')}`);
      }

      if (filteredPrograms.length === 0) {
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // 4. Build student profile for constraints
      const studentProfile = this.buildStudentProfile(profile, preferences);

      // 5. Apply soft constraints (level, budget, location) - Use as scoring factors, not hard filters
      let candidatePrograms = filteredPrograms;
      const beforeConstraints = candidatePrograms.length;

      this.logger.log(`═══════════════════════════════════════════════════════════`);
      this.logger.log(`[CONSTRAINTS] Applying soft constraints (not hard filters)`);
      this.logger.log(`Before constraints: ${beforeConstraints} programs`);
      this.logger.log(`Student level: ${studentProfile.studyLevel || 'Not specified'}`);
      this.logger.log(`Student budget: ${studentProfile.budget ? `RM ${studentProfile.budget.toLocaleString()}` : 'Not specified'}`);
      this.logger.log(`Preferred states: ${studentProfile.preferredStates?.join(', ') || 'Not specified'}`);

      // Level filter - More lenient
      if (studentProfile.studyLevel) {
        const beforeLevel = candidatePrograms.length;
        candidatePrograms = candidatePrograms.filter(p => {
          const programLevel = (p.level || '').toLowerCase();
          const studentLevel = studentProfile.studyLevel?.toLowerCase() || '';
          // More flexible matching
          if (studentLevel.includes('bachelor') || studentLevel.includes('degree')) {
            return programLevel.includes('bachelor') || programLevel.includes('degree') || programLevel.includes('undergraduate');
          }
          if (studentLevel.includes('master')) {
            return programLevel.includes('master') || programLevel.includes('graduate');
          }
          if (studentLevel.includes('phd') || studentLevel.includes('doctorate')) {
            return programLevel.includes('phd') || programLevel.includes('doctorate') || programLevel.includes('doctoral');
          }
          // If no specific match, allow it (soft constraint)
          return true;
        });
        this.logger.log(`After level filter: ${candidatePrograms.length} programs (removed ${beforeLevel - candidatePrograms.length})`);
      }

      // Budget filter - More lenient (50% tolerance instead of 10%)
      if (studentProfile.budget) {
        const beforeBudget = candidatePrograms.length;
        candidatePrograms = candidatePrograms.filter(p => {
          if (!p.tuition_fee) return true;
          // Allow 50% over budget (soft constraint)
          return p.tuition_fee <= studentProfile.budget! * 1.5;
        });
        this.logger.log(`After budget filter: ${candidatePrograms.length} programs (removed ${beforeBudget - candidatePrograms.length})`);
      }

      // Location filter - More lenient (prefer but don't require)
      if (studentProfile.preferredStates && studentProfile.preferredStates.length > 0) {
        const beforeLocation = candidatePrograms.length;
        // Don't filter out, just note preference
        // We'll let ML model handle location preference as a scoring factor
        this.logger.log(`Location preference noted: ${studentProfile.preferredStates.join(', ')} (not filtering out)`);
      }

      // If constraints filtered out everything, relax them
      if (candidatePrograms.length === 0 && beforeConstraints > 0) {
        this.logger.warn(`⚠️ All programs filtered out by constraints. Relaxing constraints and using all ${beforeConstraints} programs.`);
        candidatePrograms = filteredPrograms; // Use all programs in field
      }

      this.logger.log(`Final candidate programs: ${candidatePrograms.length} programs`);
      this.logger.log(`═══════════════════════════════════════════════════════════`);

      if (candidatePrograms.length === 0) {
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // 6. STEP 1: Use ML model to rank programs and get top 3
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[ML MODEL] Ranking programs using ML model');
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Update studentProfile with the selected field ID
      studentProfile.fieldIds = [fieldId];

      // Transform programs for ML model
      const programsForML = candidatePrograms.map((p) => {
        let durationMonths: number | undefined;
        if (p.duration) {
          const durationStr = p.duration.toLowerCase();
          if (durationStr.includes('year')) {
            const years = parseFloat(durationStr);
            if (!isNaN(years)) {
              durationMonths = Math.round(years * 12);
            }
          } else if (durationStr.includes('month')) {
            const months = parseFloat(durationStr);
            if (!isNaN(months)) {
              durationMonths = Math.round(months);
            }
          }
        }

        return {
          program_id: p.id,
          university_id: p.university_id || 0,
          field_id: p.field_id || 0,
          tuition_fee: p.tuition_fee || undefined,
          duration_months: durationMonths,
          level: p.level || 'Bachelor',
        };
      });

      let mlRecommendations: AIRecommendationResponseDto | null = null;
      try {
        const pythonRequest = {
          student_profile: {
            study_level: studentProfile.studyLevel,
            field_ids: studentProfile.fieldIds,
            cgpa: studentProfile.cgpa,
            budget: studentProfile.budget,
            preferred_states: studentProfile.preferredStates,
          },
          programs: programsForML,
        };

        this.logger.log(`Calling Python ML service with ${programsForML.length} programs for field "${fieldName}"`);
        mlRecommendations = await this.callPythonAIService(pythonRequest);
        this.logger.log(`Received ${mlRecommendations.recommendations.length} recommendations from ML model`);

        // Log top ML recommendations
        if (mlRecommendations.recommendations.length > 0) {
          mlRecommendations.recommendations.slice(0, 3).forEach((rec, idx) => {
            this.logger.log(`  ML Rank ${idx + 1}: Program ID ${rec.program_id} - Score: ${(rec.score * 100).toFixed(2)}%`);
          });
        }
      } catch (error: any) {
        this.logger.error('ML model failed:', error.message || error);
        this.logger.error('Error stack:', error.stack);
        // Continue with fallback
      }

      // Get top 3 from ML model
      let top3MLPrograms: ProgramWithUniversity[];
      if (mlRecommendations && mlRecommendations.recommendations.length > 0) {
        this.logger.log(`✅ ML model returned ${mlRecommendations.recommendations.length} recommendations`);
        const mlPrograms = mlRecommendations.recommendations
          .slice(0, 3)
          .map(rec => {
            const program = candidatePrograms.find(p => p.id === rec.program_id);
            if (!program) {
              this.logger.warn(`⚠️ ML recommended program ID ${rec.program_id} not found in candidate programs`);
            }
            return program;
          })
          .filter((p): p is ProgramWithUniversity => p !== undefined);
        
        // If ML returned valid programs, use them
        if (mlPrograms.length > 0) {
          top3MLPrograms = mlPrograms;
          this.logger.log(`✅ Using ${top3MLPrograms.length} programs from ML model`);
        } else {
          // ML returned invalid IDs, fallback to first 3 candidates
          this.logger.warn(`⚠️ ML model returned invalid program IDs. Using first 3 candidates as fallback.`);
          top3MLPrograms = candidatePrograms.slice(0, 3);
        }
      } else {
        // ML model failed or returned empty, use first 3 candidates
        this.logger.warn(`⚠️ ML model failed or returned no results. Using first 3 candidates as fallback.`);
        top3MLPrograms = candidatePrograms.slice(0, 3);
      }

      this.logger.log(`Top 3 programs selected: ${top3MLPrograms.map(p => `${p.id} (${p.name?.substring(0, 30)}...)`).join(', ')}`);
      
      if (top3MLPrograms.length === 0) {
        this.logger.error(`❌ No programs available after ML model processing`);
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // 7. STEP 2: Use OpenAI to validate and explain the top 3 ML recommendations
      if (!this.openai) {
        this.logger.warn('OpenAI not configured - returning ML results only');
        return {
          recommendations: top3MLPrograms.map((p, idx) => ({
            program_id: p.id,
            rank: idx + 1,
            match_score: mlRecommendations?.recommendations.find(r => r.program_id === p.id)?.score,
            explanation: `Recommended program in ${fieldName} field based on ML model analysis.`,
            reasons: [`Field match: ${fieldName}`, 'ML model recommendation'],
          })),
          powered_by: ['ML Model'],
        };
      }

      // Use OpenAI to validate and explain the top 3 ML recommendations
      const validatedPrograms = await this.validateProgramsWithOpenAI(
        profile,
        preferences,
        top3MLPrograms,
        fieldName,
        studentProfile,
        mlRecommendations?.recommendations || [],
      );

      // Save program recommendations to database
      try {
        await this.saveProgramRecommendations(
          userId,
          fieldId,
          fieldName,
          validatedPrograms,
          mlRecommendations?.recommendations || [],
          ['ML Model', 'OpenAI Validation'],
        );
        this.logger.log(`✅ Program recommendations saved to database for field "${fieldName}"`);
      } catch (saveError: any) {
        this.logger.warn('⚠️ Failed to save program recommendations to database:', saveError.message);
        // Don't fail the request if saving fails
      }

      return {
        recommendations: validatedPrograms,
        powered_by: ['ML Model', 'OpenAI Validation'],
      };
    } catch (error) {
      this.logger.error('Error generating programs by field:', error);
      throw new HttpException(
        'Failed to generate program recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Use OpenAI to validate and explain top 3 ML-recommended programs
   */
  private async validateProgramsWithOpenAI(
    profile: any,
    preferences: any,
    top3Programs: ProgramWithUniversity[],
    fieldName: string,
    studentProfile: StudentProfileData,
    mlRecommendations: Array<{ program_id: number; score: number }>,
  ): Promise<FinalRecommendationDto[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Use the top 3 programs from ML model
    const topCandidates = top3Programs;

    // Build student summary
    const studentSummary = this.buildStudentSummary(profile, preferences);

    // Build program summaries
    const programSummaries = topCandidates.map((p) => {
      let durationMonths: number | undefined;
      if (p.duration) {
        const durationStr = p.duration.toLowerCase();
        if (durationStr.includes('year')) {
          const years = parseFloat(durationStr);
          if (!isNaN(years)) {
            durationMonths = Math.round(years * 12);
          }
        } else if (durationStr.includes('month')) {
          const months = parseFloat(durationStr);
          if (!isNaN(months)) {
            durationMonths = Math.round(months);
          }
        }
      }

      return {
        id: p.id,
        name: p.name,
        university: p.university?.name || 'Unknown',
        location: p.university?.state || 'Unknown',
        level: p.level || 'Unknown',
        tuition: p.tuition_fee ? `RM ${p.tuition_fee.toLocaleString()}` : 'Not specified',
        duration: durationMonths ? `${durationMonths} months` : (p.duration || 'Not specified'),
        description: p.description ? p.description.substring(0, 200) : 'No description',
        employment_rate: p.employment_rate || null,
        average_salary: p.average_salary || null,
        rating: p.rating || null,
      };
    });

    // Get ML scores for each program
    const scoreMap = new Map(mlRecommendations.map(r => [r.program_id, r.score]));

    const systemPrompt = `You are an academic advisor helping a Malaysian student validate and understand ML model recommendations for the "${fieldName}" field.

**Your Task:**
1. The ML model has already selected the TOP 3 programs for this field
2. Your role is to VALIDATE these recommendations and provide detailed explanations
3. For each of the 3 programs, explain WHY it fits the student's profile
4. Reference the ML model's confidence scores
5. Highlight how each program aligns with:
   - Student's subject strengths
   - Student's interests and skills
   - Budget constraints
   - Location preferences
   - Career alignment

**Important:**
- DO NOT change the program selection (these are already the top 3 from ML model)
- DO NOT re-rank the programs
- Focus on VALIDATION and EXPLANATION only
- Use the exact program IDs provided

**Output Format:**
Return a JSON array with exactly 3 programs in the SAME ORDER, each with:
- program_id: The exact program ID from the list (must match exactly)
- reason: A detailed explanation (3-4 sentences) explaining:
  * Why this program matches the student's profile
  * How it aligns with their subject strengths
  * How it matches their interests/skills
  * Career alignment and outcomes
  * Reference the ML model's confidence score if available

Maintain the same order as provided.`;

    const userPrompt = `Student Profile:
${studentSummary}

Field: ${fieldName}

ML Model's Top 3 Recommended Programs (already selected, in order):
${programSummaries.map((p, idx) => {
  const mlScore = scoreMap.get(p.id);
  return `Program ${idx + 1}: ${p.name} (ID: ${p.id}) at ${p.university}, ${p.location}
   - ML Model Score: ${mlScore ? `${(mlScore * 100).toFixed(1)}%` : 'N/A'}
   - Level: ${p.level}
   - Tuition: ${p.tuition}
   - Duration: ${p.duration}
   - Employment Rate: ${p.employment_rate ? `${p.employment_rate}%` : 'Not available'}
   - Average Salary: ${p.average_salary ? `RM ${p.average_salary.toLocaleString()}` : 'Not available'}
   - Rating: ${p.rating ? `${p.rating}/5.0` : 'Not available'}
   - Description: ${p.description}`;
}).join('\n\n')}

**Your Task:**
Validate these 3 programs and provide detailed explanations for why each one fits the student.
DO NOT change the program IDs or order - these are already the ML model's top 3 selections.

Return as JSON array (same order, same IDs):
[
  {"program_id": ${programSummaries[0]?.id || 0}, "reason": "Detailed explanation..."},
  {"program_id": ${programSummaries[1]?.id || 0}, "reason": "Detailed explanation..."},
  {"program_id": ${programSummaries[2]?.id || 0}, "reason": "Detailed explanation..."}
]`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      let parsed: any;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          parsed = JSON.parse(content);
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse OpenAI response, using ML results only');
        // Fallback: return ML model's top 3 with basic explanations
        const mlScoreMap = new Map(mlRecommendations.map(r => [r.program_id, r.score]));
        return topCandidates.slice(0, 3).map((p, idx) => {
          const mlScore = mlScoreMap.get(p.id);
          const reasons: string[] = [`Field match: ${fieldName}`];
          if (mlScore) {
            reasons.push(`ML model confidence: ${Math.round(mlScore * 100)}%`);
          }
          return {
            program_id: p.id,
            rank: idx + 1,
            match_score: mlScore,
            explanation: `Recommended program in ${fieldName} field based on ML model analysis.`,
            reasons: reasons,
          };
        });
      }

      const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];

      // Map OpenAI response to final format, ensuring valid program IDs
      // Use position-based mapping to maintain ML model's ranking order
      const validRecommendations: FinalRecommendationDto[] = [];

      for (let idx = 0; idx < Math.min(3, topCandidates.length); idx++) {
        const program = topCandidates[idx];
        const mlRec = mlRecommendations.find(r => r.program_id === program.id);
        const mlScore = mlRec?.score;

        // Try to find OpenAI's explanation for this program
        const openAIRec = recommendations.find((r: any) => r.program_id === program.id);
        const explanation = openAIRec?.reason || `Recommended program in ${fieldName} field based on ML model analysis.`;

        // Generate reasons
        const reasons: string[] = [`Field match: ${fieldName}`];
        if (mlScore) {
          reasons.push(`ML model confidence: ${Math.round(mlScore * 100)}%`);
        }

        validRecommendations.push({
          program_id: program.id,
          rank: idx + 1,
          match_score: mlScore,
          explanation: explanation,
          reasons: reasons,
        });
      }

      return validRecommendations;
    } catch (error: any) {
      this.logger.error('OpenAI validation error:', error);
      // Fallback: return ML model's top 3 with basic explanations
      const mlScoreMap = new Map(mlRecommendations.map(r => [r.program_id, r.score]));
      return topCandidates.slice(0, 3).map((p, idx) => {
        const mlScore = mlScoreMap.get(p.id);
        const reasons: string[] = [`Field match: ${fieldName}`];
        if (mlScore) {
          reasons.push(`ML model confidence: ${Math.round(mlScore * 100)}%`);
        }
        return {
          program_id: p.id,
          rank: idx + 1,
          match_score: mlScore,
          explanation: `Recommended program in ${fieldName} field based on ML model analysis.`,
          reasons: reasons,
        };
      });
    }
  }

  /**
   * Get AI-based program recommendations for a student
   * [DEPRECATED] Use getFieldRecommendations and getProgramsByField instead
   */
  async getRecommendations(
    userId: string,
    accessToken: string,
  ): Promise<FinalRecommendationResponseDto> {
    try {
      // 1. Fetch student profile and preferences
      const { profile, preferences } = await this.fetchStudentData(userId, accessToken);

      // Log profile data for debugging
      this.logger.log(`Fetching recommendations for user ${userId}`);
      this.logger.log(`Profile exists: ${!!profile}, Preferences exists: ${!!preferences}`);
      if (profile) {
        this.logger.log(`Profile study_level: ${profile.study_level}, has grades: ${!!profile.mathematics}`);
      }

      // Validate profile exists
      if (!profile) {
        this.logger.warn('No student profile found - returning empty recommendations');
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // ===== STEP 1: FIELD INTEREST SCORING (PRIMARY GATE) =====
      // Predict field category interests from student profile (matching notebook approach)
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[STEP 1] Field Interest Scoring');
      this.logger.log('═══════════════════════════════════════════════════════════');
      
      let fieldPredictions: Array<{ field_name: string; probability: number }> = [];
      try {
        fieldPredictions = await this.predictFieldInterests(profile);
        
        this.logger.log(`Field predictions received: ${fieldPredictions.length} fields`);
        fieldPredictions.slice(0, 5).forEach((pred, idx) => {
          this.logger.log(`  ${idx + 1}. ${pred.field_name}: ${(pred.probability * 100).toFixed(2)}%`);
        });
      } catch (error) {
        this.logger.error('Field prediction failed, falling back to all fields:', error);
        // Fallback: continue with all fields
      }

      // Select top N fields (default: top 3)
      const TOP_FIELDS = 3;
      const topFields = fieldPredictions.slice(0, TOP_FIELDS);
      this.logger.log(`Selected top ${topFields.length} fields for filtering`);

      // ===== STEP 2: MAP FIELD CATEGORIES TO DATABASE FIELD IDs =====
      const fieldNames = topFields.map(f => f.field_name);
      const topFieldIds = await this.mapFieldNamesToIds(fieldNames);
      
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[STEP 2] Field ID Mapping');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`Field names: ${fieldNames.join(', ')}`);
      this.logger.log(`Mapped to field IDs: ${topFieldIds.join(', ')}`);

      if (topFieldIds.length === 0 && fieldPredictions.length > 0) {
        this.logger.warn('No field IDs mapped - this may indicate field name mismatch. Continuing with all fields.');
      }

      // 2. Build student profile for AI service
      const studentProfile = this.buildStudentProfile(profile, preferences);
      
      // Update studentProfile with predicted field IDs
      if (topFieldIds.length > 0) {
        studentProfile.fieldIds = topFieldIds;
      }
      
      // ===== COMPREHENSIVE MODEL INPUT LOGGING =====
      const academicQualification = profile.study_level || 'Not specified';
      const preferredFields = (studentProfile.fieldIds && studentProfile.fieldIds.length > 0)
        ? `Fields: ${studentProfile.fieldIds.join(', ')} (from ML prediction)` 
        : 'All fields (no preference)';
      const programLevel = studentProfile.studyLevel || 'Not specified';
      const tuitionBudget = studentProfile.budget 
        ? `RM ${studentProfile.budget.toLocaleString()}` 
        : 'Not specified';
      const locationPreference = (studentProfile.preferredStates && studentProfile.preferredStates.length > 0)
        ? studentProfile.preferredStates.join(', ')
        : 'No preference';
      const cgpaValue = studentProfile.cgpa 
        ? studentProfile.cgpa.toFixed(2) 
        : 'Not calculated';
      
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[AI INPUT] Model Input Integrity Check');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`Academic Qualification: ${academicQualification}`);
      this.logger.log(`Preferred Field(s): ${preferredFields}`);
      this.logger.log(`Program Level: ${programLevel}`);
      this.logger.log(`Tuition Budget: ${tuitionBudget}`);
      this.logger.log(`Location Preference: ${locationPreference}`);
      this.logger.log(`CGPA: ${cgpaValue}`);
      this.logger.log(`Timestamp: ${new Date().toISOString()}`);
      this.logger.log('═══════════════════════════════════════════════════════════');

      // 3. Fetch candidate programs from database
      const candidatePrograms = await this.programsService.getPrograms(false); // Active programs only
      
      // ===== STEP 3: FILTER PROGRAMS BY TOP FIELDS =====
      let filteredPrograms = candidatePrograms;
      if (topFieldIds.length > 0) {
        filteredPrograms = candidatePrograms.filter(p => 
          p.field_id && topFieldIds.includes(p.field_id)
        );
        this.logger.log('═══════════════════════════════════════════════════════════');
        this.logger.log('[STEP 3] Program Filtering by Field');
        this.logger.log('═══════════════════════════════════════════════════════════');
        this.logger.log(`Total programs: ${candidatePrograms.length}`);
        this.logger.log(`Filtered to top fields: ${filteredPrograms.length}`);
        this.logger.log(`Filtered out: ${candidatePrograms.length - filteredPrograms.length} programs`);
      } else {
        this.logger.log('No field filtering applied (no field IDs mapped)');
      }

      this.logger.log(`Found ${candidatePrograms.length} candidate programs`);
      if (candidatePrograms.length > 0) {
        const sampleIds = candidatePrograms.slice(0, 10).map(p => p.id);
        this.logger.log(`🔍 Program IDs from database (first 10): ${sampleIds.join(', ')}`);
      }

      if (filteredPrograms.length === 0) {
        this.logger.warn('No programs found after field filtering');
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // ===== STEP 4: PROGRAM RANKING (WITHIN FILTERED FIELDS) =====
      // Transform filtered programs for AI service
      const programsForAI = filteredPrograms.map((p) => {
        // Calculate duration_months from duration string if needed
        let durationMonths: number | undefined;
        if (p.duration) {
          // Try to extract months from duration string (e.g., "3 years" -> 36, "24 months" -> 24)
          const durationStr = p.duration.toLowerCase();
          if (durationStr.includes('year')) {
            const years = parseFloat(durationStr);
            if (!isNaN(years)) {
              durationMonths = Math.round(years * 12);
            }
          } else if (durationStr.includes('month')) {
            const months = parseFloat(durationStr);
            if (!isNaN(months)) {
              durationMonths = Math.round(months);
            }
          }
        }

        return {
          program_id: p.id,
          university_id: p.university_id || 0,
          field_id: p.field_id || 0,
          tuition_fee: p.tuition_fee || undefined,
          duration_months: durationMonths,
          level: p.level || 'Bachelor',
        };
      });

      // 5. Call Python AI service
      let mlRecommendations: AIRecommendationResponseDto | null = null;
      try {
        // Transform to Python service format (snake_case)
        const pythonRequest = {
          student_profile: {
            study_level: studentProfile.studyLevel,
            field_ids: studentProfile.fieldIds,
            cgpa: studentProfile.cgpa,
            budget: studentProfile.budget,
            preferred_states: studentProfile.preferredStates,
          },
          programs: programsForAI,
        };
        
        // Log request (without full program list to avoid spam)
        this.logger.log(`Calling Python AI service with ${programsForAI.length} programs`);
        this.logger.log(`Student profile: study_level=${pythonRequest.student_profile.study_level}, field_ids=${pythonRequest.student_profile.field_ids?.length || 0}, cgpa=${pythonRequest.student_profile.cgpa}, budget=${pythonRequest.student_profile.budget}`);
        
        // Log first few program IDs being sent to Python
        const sentProgramIds = programsForAI.slice(0, 10).map(p => p.program_id);
        this.logger.log(`🔍 Program IDs being sent to Python (first 10): ${sentProgramIds.join(', ')}`);
        
        mlRecommendations = await this.callPythonAIService(pythonRequest);
        this.logger.log(`Received ${mlRecommendations.recommendations.length} recommendations from ML model`);
        
        // Create set of valid program IDs that were sent to Python
        const sentIdSet = new Set(programsForAI.map(p => p.program_id));
        
        if (mlRecommendations.recommendations.length > 0) {
          const returnedIds = mlRecommendations.recommendations.map(r => r.program_id);
          this.logger.log(`🔍 Program IDs returned from Python: ${returnedIds.join(', ')}`);
          
          // ===== STEP 2: LOG MODEL SCORES PER PROGRAM =====
          this.logger.log('═══════════════════════════════════════════════════════════');
          this.logger.log('[ML MODEL SCORES] Match scores per program');
          this.logger.log('═══════════════════════════════════════════════════════════');
          mlRecommendations.recommendations.slice(0, 10).forEach((rec, idx) => {
            this.logger.log(`Rank ${idx + 1}: Program ID ${rec.program_id} - Score: ${(rec.score * 100).toFixed(2)}%`);
          });
          this.logger.log('═══════════════════════════════════════════════════════════');
          
          // Verify IDs exist in sent programs and filter out invalid ones
          const invalidIds = returnedIds.filter(id => !sentIdSet.has(id));
          if (invalidIds.length > 0) {
            this.logger.error(`❌ CRITICAL: Python returned ${invalidIds.length} invalid program IDs that weren't sent: ${invalidIds.join(', ')}`);
            this.logger.error(`   These IDs don't exist in the ${programsForAI.length} programs we sent`);
            // Filter out invalid IDs - only keep recommendations with valid program IDs
            mlRecommendations.recommendations = mlRecommendations.recommendations.filter(
              r => sentIdSet.has(r.program_id)
            );
            this.logger.log(`   ✅ Filtered to ${mlRecommendations.recommendations.length} valid recommendations`);
          } else {
            this.logger.log(`✅ All returned program IDs are valid`);
          }
        }
        
        if (mlRecommendations.recommendations.length === 0) {
          this.logger.warn('ML model returned 0 recommendations - this might indicate hard constraints filtered everything out');
        }
      } catch (error: any) {
        this.logger.error('Python AI service failed:', error);
        this.logger.error(`Error details: ${error.message || JSON.stringify(error)}`);
        // Fallback: return empty recommendations
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // 6. Apply OpenAI second-layer validation
      let finalRecommendations: FinalRecommendationDto[] = [];
      const poweredBy: string[] = ['ML Model'];

      // Safety check: ensure mlRecommendations is valid
      if (!mlRecommendations || !mlRecommendations.recommendations) {
        this.logger.error('Invalid ML recommendations structure received');
        return {
          recommendations: [],
          powered_by: [],
        };
      }

      // ===== STEP 5: APPLY POST-PROCESSING RULES =====
      // Apply rule-based adjustments to reduce similarity and improve differentiation
      const postProcessedRecommendations = this.applyPostProcessingRules(
        mlRecommendations.recommendations,
        filteredPrograms,
        studentProfile,
      );

      if (this.openai && postProcessedRecommendations.length > 0) {
        try {
          const openaiResult = await this.applyOpenAIValidation(
            profile,
            preferences,
            filteredPrograms,
            postProcessedRecommendations,
            studentProfile,
            topFields, // Pass field predictions for context
          );
          finalRecommendations = openaiResult;
          poweredBy.push('OpenAI Validation');
          this.logger.log('OpenAI validation completed successfully');
        } catch (error) {
          this.logger.warn('OpenAI validation failed, using ML results only:', error);
          // Fallback to ML results with explainability
          finalRecommendations = this.convertMLToFinalRecommendations(
            postProcessedRecommendations,
            filteredPrograms,
            studentProfile,
          );
          this.logger.log(`Converted ${finalRecommendations.length} ML recommendations to final format (fallback)`);
        }
      } else {
        // No OpenAI, use ML results directly with explainability
        this.logger.log('OpenAI not configured, using ML results directly');
        finalRecommendations = this.convertMLToFinalRecommendations(
          postProcessedRecommendations,
          candidatePrograms,
          studentProfile,
        );
        this.logger.log(`Converted ${finalRecommendations.length} ML recommendations to final format`);
      }

      this.logger.log(`Returning ${finalRecommendations.length} final recommendations`);
      if (finalRecommendations.length > 0) {
        this.logger.log(`First recommendation: ${JSON.stringify(finalRecommendations[0])}`);
      }
      this.logger.log(`Powered by: ${poweredBy.join(', ')}`);
      
      const response = {
        recommendations: finalRecommendations,
        powered_by: poweredBy,
      };
      
      this.logger.log(`Response structure: ${JSON.stringify({ 
        recommendations_count: response.recommendations.length,
        powered_by: response.powered_by 
      })}`);
      
      return response;
    } catch (error) {
      this.logger.error('Error generating recommendations:', error);
      throw new HttpException(
        'Failed to generate recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch student profile and preferences from database
   */
  private async fetchStudentData(userId: string, accessToken: string) {
    const db = this.supabaseService.getClient();

    // Fetch profile - explicitly select all fields to ensure nothing is missing
    const { data: profile, error: profileError } = await db
      .from('student_profile')
      .select(`
        *,
        user_id,
        study_level,
        extracurricular,
        bm, english, history, mathematics,
        islamic_education_moral_education,
        physics, chemistry, biology, additional_mathematics,
        geography, economics, accounting,
        chinese, tamil, ict,
        maths_interest, science_interest, computer_interest,
        writing_interest, art_interest, business_interest, social_interest,
        logical_thinking, problem_solving, creativity,
        communication, teamwork, leadership, attention_to_detail
      `)
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK
      this.logger.error('Error fetching student profile:', profileError);
      throw new HttpException('Failed to fetch student profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Log all profile fields to verify data completeness
    if (profile) {
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[DEBUG] Raw Profile Data from Database:');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`All profile keys: ${Object.keys(profile).join(', ')}`);
      // Log all grade fields
      const gradeFields = ['bm', 'english', 'history', 'mathematics', 'islamic_education_moral_education',
        'physics', 'chemistry', 'biology', 'additional_mathematics', 'geography', 'economics',
        'accounting', 'chinese', 'tamil', 'ict'];
      gradeFields.forEach(field => {
        const value = profile[field];
        this.logger.log(`  ${field}: ${value !== undefined && value !== null ? value : 'NULL/UNDEFINED'} (type: ${typeof value})`);
      });
      // Log interests
      const interestFields = ['maths_interest', 'science_interest', 'computer_interest', 'writing_interest',
        'art_interest', 'business_interest', 'social_interest'];
      interestFields.forEach(field => {
        const value = profile[field];
        this.logger.log(`  ${field}: ${value !== undefined && value !== null ? value : 'NULL/UNDEFINED'} (type: ${typeof value})`);
      });
      // Log skills
      const skillFields = ['logical_thinking', 'problem_solving', 'creativity', 'communication',
        'teamwork', 'leadership', 'attention_to_detail'];
      skillFields.forEach(field => {
        const value = profile[field];
        this.logger.log(`  ${field}: ${value !== undefined && value !== null ? value : 'NULL/UNDEFINED'} (type: ${typeof value})`);
      });
      this.logger.log(`  study_level: ${profile.study_level || 'NULL'}`);
      this.logger.log(`  extracurricular: ${profile.extracurricular !== undefined ? profile.extracurricular : 'NULL'}`);
      this.logger.log('═══════════════════════════════════════════════════════════');
    } else {
      this.logger.warn('⚠️ Profile is null or undefined!');
    }

    // Fetch preferences
    const { data: preferences, error: preferencesError } = await db
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      this.logger.error('Error fetching preferences:', preferencesError);
      throw new HttpException('Failed to fetch preferences', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { profile: profile || null, preferences: preferences || null };
  }

  /**
   * Build student profile object for AI service
   */
  private buildStudentProfile(profile: any, preferences: any): StudentProfileData {
    if (!profile) {
      this.logger.warn('buildStudentProfile called with null profile');
      return {
        studyLevel: 'Bachelor',
        fieldIds: [],
        cgpa: undefined,
        budget: undefined,
        preferredStates: undefined,
      };
    }

    // Map study level from database enum to AI service format
    const levelMap: Record<string, string> = {
      SPM: 'Foundation',
      STPM: 'Bachelor',
    };
    const studyLevel = profile.study_level ? levelMap[profile.study_level] || 'Bachelor' : 'Bachelor';

    // Extract field IDs from interests
    // For now, we'll leave it empty to allow all fields (Python service handles this)
    // In the future, we can map interests to field IDs based on interest scores
    const fieldIds: number[] = [];
    
    // TODO: Map student interests to field IDs
    // For example, if computer_interest is high, add computer science field IDs
    // This requires a mapping table between interests and field_of_interest table

    // Calculate CGPA from grades (simplified calculation)
    const cgpa = this.calculateCGPA(profile);

    // Parse budget from preferences
    let budget: number | undefined;
    if (preferences?.budget_range) {
      // Parse budget range string (e.g., "30000-50000" or "50000+")
      const budgetStr = preferences.budget_range.replace(/[^\d-+]/g, '');
      if (budgetStr.includes('-')) {
        const [min, max] = budgetStr.split('-').map(Number);
        budget = max; // Use upper bound
      } else if (budgetStr.includes('+')) {
        budget = Number(budgetStr.replace('+', ''));
      } else {
        budget = Number(budgetStr);
      }
    }

    // Parse preferred states from preferences
    const preferredStates: string[] = [];
    if (preferences?.preferred_location) {
      // Assuming preferred_location is a state name or comma-separated list
      preferredStates.push(...preferences.preferred_location.split(',').map((s: string) => s.trim()));
    }

    return {
      studyLevel: studyLevel,
      fieldIds: fieldIds,
      cgpa,
      budget,
      preferredStates: preferredStates.length > 0 ? preferredStates : undefined,
    };
  }

  /**
   * Calculate CGPA from subject grades (simplified)
   */
  private calculateCGPA(profile: any): number | undefined {
    if (!profile) return undefined;

    // Grade to point mapping
    const gradePoints: Record<string, number> = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      E: 0.5,
      G: 0.0,
      '0': 0.0, // Not taken
    };

    const subjects = [
      'bm',
      'english',
      'mathematics',
      'physics',
      'chemistry',
      'biology',
      'additional_mathematics',
      'accounting',
      'economics',
    ];

    let totalPoints = 0;
    let count = 0;

    for (const subject of subjects) {
      const grade = profile[subject];
      if (grade && grade !== '0' && gradePoints[grade] !== undefined) {
        totalPoints += gradePoints[grade];
        count++;
      }
    }

    if (count === 0) return undefined;
    return totalPoints / count;
  }

  /**
   * Call Python AI service for ML-based recommendations
   */
  /**
   * Map ML model field names to database field names
   * This ensures we only return fields that exist in the database
   * 
   * Database fields (updated):
   * 1. Computer Science & IT
   * 2. Engineering
   * 3. Accounting & Business
   * 4. Medicine, Dentistry & Pharmacy
   * 5. Culinary Arts & Hospitality
   * 6. Data Science & AI
   * 7. Law
   * 8. Design & Media Production
   * 9. Education & Teaching
   * 10. Health Science
   * 11. Mathematics & Actuarial Science
   * 12. Psychology
   * 13. Communication & Media
   * 14. Architecture
   */
  private getFieldNameMapping(): Map<string, string> {
    const mapping = new Map<string, string>([
      // Exact matches
      ['Computer Science & IT', 'Computer Science & IT'],
      ['Engineering', 'Engineering'],
      ['Law', 'Law'],
      ['Health Science', 'Health Science'],
      ['Medicine, Dentistry & Pharmacy', 'Medicine, Dentistry & Pharmacy'],
      ['Architecture & Built Environment', 'Architecture'],
      
      // Business-related mappings
      ['Business & Management', 'Accounting & Business'],
      
      // Education mappings
      ['Education', 'Education & Teaching'],
      
      // Design & Arts mappings
      ['Arts & Design', 'Design & Media Production'],
      
      // Hospitality mappings
      ['Hospitality & Tourism', 'Culinary Arts & Hospitality'],
      
      // Data Science (new field in database, not in ML model - will be handled separately)
      // 'Data Science & AI' - not in ML model output, but exists in database
      
      // Communication (new field in database, not in ML model)
      // 'Communication & Media' - not in ML model output, but exists in database
      
      // Mathematics (new field in database, not in ML model)
      // 'Mathematics & Actuarial Science' - not in ML model output, but exists in database
      
      // Psychology (exists in database, might be mapped from Social Sciences or Others)
      ['Social Sciences', 'Psychology'], // Map Social Sciences to Psychology as closest match
      
      // Fields that don't have direct matches - will be filtered out
      // 'Traditional and Complementary Medicine' - could map to Health Science or Medicine
      // 'Agriculture & Forestry' - no direct match
      // 'Others' - no direct match
    ]);
    return mapping;
  }

  /**
   * STEP 1: Predict field category interests from student profile
   * This matches the notebook's field-first recommendation approach
   */
  private async predictFieldInterests(profile: any): Promise<Array<{ field_name: string; probability: number }>> {
    try {
      // Map database field names to Python service format
      // IMPORTANT: These must match the exact column names in the student_profile table
      const gradeMapping: Record<string, string> = {
        bm: 'BM',
        english: 'English',
        history: 'History',
        mathematics: 'Mathematics',
        islamic_education_moral_education: 'IslamicOrMoral', // Database uses snake_case
        physics: 'Physics',
        chemistry: 'Chemistry',
        biology: 'Bio',
        additional_mathematics: 'AddMaths', // Database uses snake_case
        geography: 'Geography',
        economics: 'Economics',
        accounting: 'Accounting',
        chinese: 'Chinese',
        tamil: 'Tamil',
        ict: 'ICT', // This is the key field for CS/IT predictions
      };
      
      // Verify all expected fields exist in profile
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[DEBUG] Verifying Profile Field Access:');
      this.logger.log('═══════════════════════════════════════════════════════════');
      Object.keys(gradeMapping).forEach(dbKey => {
        const value = profile[dbKey];
        const exists = dbKey in profile;
        const isNull = value === null;
        const isUndefined = value === undefined;
        const isEmpty = value === '' || value === '0';
        this.logger.log(`  ${dbKey}: exists=${exists}, null=${isNull}, undefined=${isUndefined}, empty=${isEmpty}, value="${value}"`);
      });
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Build grades dictionary - use '0' for missing/null values
      const grades: Record<string, string> = {};
      for (const [dbKey, pythonKey] of Object.entries(gradeMapping)) {
        const value = profile[dbKey];
        // Handle null, undefined, empty string, or '0' as '0'
        grades[pythonKey] = (value && value !== '0' && value !== '') ? String(value) : '0';
      }

      // Build subject_taken dictionary - more comprehensive check
      // A subject is "taken" if:
      // 1. The grade field exists and is not null/undefined
      // 2. The grade is not '0' or empty string
      const subjectTaken: Record<string, number> = {};
      for (const [dbKey, pythonKey] of Object.entries(gradeMapping)) {
        const tookKey = `Took_${pythonKey}`;
        const value = profile[dbKey];
        // Subject is taken if value exists, is not null/undefined, and is not '0' or empty
        const isTaken = value !== null && 
                       value !== undefined && 
                       value !== '' && 
                       value !== '0' &&
                       String(value).trim() !== '';
        subjectTaken[tookKey] = isTaken ? 1 : 0;
        if (!isTaken && pythonKey === 'ICT') {
          this.logger.warn(`⚠️ ICT subject not taken - value: ${value} (type: ${typeof value})`);
        }
      }
      
      // Log subject taken summary
      const takenCount = Object.values(subjectTaken).filter(v => v === 1).length;
      this.logger.log(`[DEBUG] Subjects taken: ${takenCount} out of ${Object.keys(subjectTaken).length}`);
      this.logger.log(`[DEBUG] Subject taken details: ${JSON.stringify(subjectTaken)}`);

      // Build interests dictionary
      const interests: Record<string, number> = {
        Maths_Interest: profile.maths_interest || 3,
        Science_Interest: profile.science_interest || 3,
        Computer_Interest: profile.computer_interest || 3,
        Writing_Interest: profile.writing_interest || 3,
        Art_Interest: profile.art_interest || 3,
        Business_Interest: profile.business_interest || 3,
        Social_Interest: profile.social_interest || 3,
      };

      // Build skills dictionary
      const skills: Record<string, number> = {
        Logical: profile.logical_thinking || 3,
        Problem_Solving: profile.problem_solving || 3,
        Creativity: profile.creativity || 3,
        Communication: profile.communication || 3,
        Teamwork: profile.teamwork || 3,
        Leadership: profile.leadership || 3,
        Attention_to_Detail: profile.attention_to_detail || 3,
      };
      
      // Debug: Log CS/IT-relevant inputs
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[DEBUG] CS/IT Relevant Student Profile Inputs:');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`  Computer_Interest: ${interests.Computer_Interest}/5`);
      this.logger.log(`  Maths_Interest: ${interests.Maths_Interest}/5`);
      this.logger.log(`  Science_Interest: ${interests.Science_Interest}/5`);
      this.logger.log(`  ICT Grade: ${grades.ICT || 'N/A'}`);
      this.logger.log(`  Mathematics Grade: ${grades.Mathematics || 'N/A'}`);
      this.logger.log(`  Physics Grade: ${grades.Physics || 'N/A'}`);
      this.logger.log(`  Took_ICT: ${subjectTaken.Took_ICT || 0}`);
      this.logger.log(`  Logical Thinking: ${skills.Logical}/5`);
      this.logger.log(`  Problem Solving: ${skills.Problem_Solving}/5`);
      this.logger.log('═══════════════════════════════════════════════════════════');

      const request = {
        study: profile.study_level || 'SPM',
        extracurricular: profile.extracurricular || false,
        grades,
        subject_taken: subjectTaken,
        interests,
        skills,
      };

      // Debug logging to see what data is being sent
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[FIELD PREDICTION] Sending data to ML model');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`Study Level: ${request.study}`);
      this.logger.log(`Extracurricular: ${request.extracurricular}`);
      this.logger.log(`Grades: ${JSON.stringify(grades)}`);
      this.logger.log(`Interests: ${JSON.stringify(interests)}`);
      this.logger.log(`Skills: ${JSON.stringify(skills)}`);
      this.logger.log(`Subject Taken: ${JSON.stringify(subjectTaken)}`);
      
      this.logger.log(`Calling Python field prediction at ${this.aiServiceUrl}/predict-fields`);
      let response;
      try {
        response = await this.httpClient.post<{ fields: Array<{ field_name: string; probability: number }> }>(
          '/predict-fields',
          request,
        );
      } catch (error: any) {
        this.logger.error('Python field prediction service error:', error.message || error);
        if (error.response) {
          this.logger.error(`Python service returned status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          this.logger.error('Python service is not reachable. Is it running?');
        }
        throw new HttpException(
          `AI service unavailable: ${error.message || 'Python service not responding'}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (!response.data || !response.data.fields) {
        this.logger.warn('Python field prediction returned invalid response structure');
        this.logger.warn(`Response data: ${JSON.stringify(response.data)}`);
        return [];
      }

      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[PYTHON RESPONSE] Raw field predictions received from ML model');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`Total fields received: ${response.data.fields.length}`);
      this.logger.log(`Full response structure: ${JSON.stringify(response.data, null, 2)}`);
      response.data.fields.slice(0, 10).forEach((f, idx) => {
        this.logger.log(`  ${idx + 1}. ${f.field_name}: ${f.probability} (${(f.probability * 100).toFixed(4)}%)`);
      });
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Map ML model field names to database field names
      const fieldMapping = this.getFieldNameMapping();
      const mappedFields = response.data.fields
        .map(f => {
          const dbFieldName = fieldMapping.get(f.field_name);
          if (dbFieldName) {
            return { field_name: dbFieldName, probability: f.probability };
          }
          // Field not in mapping - skip it
          this.logger.debug(`Skipping field "${f.field_name}" - not in database mapping`);
          return null;
        })
        .filter((f): f is { field_name: string; probability: number } => f !== null);

      // Remove duplicates (multiple ML fields might map to same DB field)
      const fieldMap = new Map<string, number>();
      for (const field of mappedFields) {
        const existing = fieldMap.get(field.field_name);
        if (!existing || field.probability > existing) {
          // Use the highest probability if duplicate
          fieldMap.set(field.field_name, field.probability);
        }
      }

      // Convert back to array and sort by probability
      const uniqueFields = Array.from(fieldMap.entries())
        .map(([field_name, probability]) => ({ field_name, probability }))
        .sort((a, b) => b.probability - a.probability);

      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[FIELD MAPPING] After mapping ML fields to database fields');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`Mapped ${response.data.fields.length} ML fields to ${uniqueFields.length} database fields`);
      if (uniqueFields.length > 0) {
        uniqueFields.slice(0, 10).forEach((f, idx) => {
          this.logger.log(`  ${idx + 1}. ${f.field_name}: ${f.probability} (${(f.probability * 100).toFixed(4)}%)`);
        });
      }
      this.logger.log('═══════════════════════════════════════════════════════════');

      // Now filter to only fields that have programs in the database
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[FILTERING] Filtering fields to only those with programs in database');
      this.logger.log('═══════════════════════════════════════════════════════════');
      const filteredFields = await this.filterFieldsWithPrograms(uniqueFields);
      this.logger.log(`After filtering: ${filteredFields.length} fields remain`);
      if (filteredFields.length > 0) {
        filteredFields.slice(0, 10).forEach((f, idx) => {
          this.logger.log(`  ${idx + 1}. ${f.field_name}: ${f.probability} (${(f.probability * 100).toFixed(4)}%)`);
        });
      }
      this.logger.log('═══════════════════════════════════════════════════════════');
      return filteredFields;
    } catch (error: any) {
      this.logger.error('Field prediction failed:', error);
      this.logger.error('Error type:', error.constructor.name);
      this.logger.error('Error message:', error.message);
      if (error.stack) {
        this.logger.error('Error stack:', error.stack);
      }
      // Re-throw HttpException as-is, wrap others
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Field prediction failed: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Filter fields to only those that have programs in the database
   */
  private async filterFieldsWithPrograms(
    fields: Array<{ field_name: string; probability: number }>
  ): Promise<Array<{ field_name: string; probability: number }>> {
    try {
      if (!fields || fields.length === 0) {
        this.logger.warn('No fields to filter');
        return [];
      }

      // Get all programs to check which fields have programs
      const allPrograms = await this.programsService.getPrograms(false);
      this.logger.log(`Checking ${fields.length} fields against ${allPrograms.length} programs`);
      
      // Get field IDs for the predicted fields
      const fieldNames = fields.map(f => f.field_name);
      
      // Create a map of field name to field ID
      const db = this.supabaseService.getClient();
      const { data: fieldData, error: fieldError } = await db
        .from('field_of_interest')
        .select('id, name')
        .in('name', fieldNames);
      
      if (fieldError) {
        this.logger.error('Error fetching fields from database:', fieldError);
        // Return original fields if database query fails
        return fields;
      }
      
      const fieldNameToIdMap = new Map<string, number>();
      if (fieldData) {
        for (const field of fieldData) {
          fieldNameToIdMap.set(field.name.toLowerCase(), field.id);
        }
        this.logger.log(`Found ${fieldNameToIdMap.size} matching fields in database`);
      }
      
      // Check which fields have programs
      const fieldsWithPrograms = fields.filter(field => {
        // Find field ID for this field name (case-insensitive)
        const fieldId = fieldNameToIdMap.get(field.field_name.toLowerCase());
        if (!fieldId) {
          this.logger.debug(`Field "${field.field_name}" not found in database`);
          return false;
        }
        
        // Check if any programs exist for this field
        const hasPrograms = allPrograms.some(p => p.field_id === fieldId);
        if (!hasPrograms) {
          this.logger.debug(`Field "${field.field_name}" (ID: ${fieldId}) has no programs in database`);
        } else {
          this.logger.debug(`Field "${field.field_name}" (ID: ${fieldId}) has programs`);
        }
        return hasPrograms;
      });
      
      this.logger.log(`Filtered ${fields.length} fields to ${fieldsWithPrograms.length} fields with programs`);
      
      return fieldsWithPrograms;
    } catch (error: any) {
      this.logger.error('Error filtering fields with programs:', error);
      this.logger.error('Error details:', error.message || error);
      // Return original fields if filtering fails (graceful degradation)
      this.logger.warn('Returning unfiltered fields due to error');
      return fields;
    }
  }

  /**
   * Map field category names to database field IDs
   */
  private async mapFieldNamesToIds(fieldNames: string[]): Promise<number[]> {
    try {
      const db = this.supabaseService.getClient();
      const { data: fields, error } = await db
        .from('field_of_interest')
        .select('id, name')
        .in('name', fieldNames);

      if (error) {
        this.logger.error('Error fetching fields:', error);
        return [];
      }

      // Create a mapping (case-insensitive, partial match)
      const fieldMap = new Map<string, number>();
      if (fields) {
        for (const field of fields) {
          fieldMap.set(field.name.toLowerCase(), field.id);
        }
      }

      // Map field names to IDs (with fuzzy matching)
      const fieldIds: number[] = [];
      for (const fieldName of fieldNames) {
        const lowerName = fieldName.toLowerCase();
        // Try exact match first
        if (fieldMap.has(lowerName)) {
          fieldIds.push(fieldMap.get(lowerName)!);
        } else {
          // Try partial match
          for (const [dbName, id] of fieldMap.entries()) {
            if (lowerName.includes(dbName) || dbName.includes(lowerName)) {
              fieldIds.push(id);
              break;
            }
          }
        }
      }

      return fieldIds;
    } catch (error) {
      this.logger.error('Error mapping field names to IDs:', error);
      return [];
    }
  }

  private async callPythonAIService(
    request: any, // Python service expects snake_case format
  ): Promise<AIRecommendationResponseDto> {
    try {
      this.logger.log(`Calling Python AI service at ${this.aiServiceUrl}/recommend`);
      const response = await this.httpClient.post<AIRecommendationResponseDto>('/recommend', request);
      this.logger.log(`Python AI service response status: ${response.status}`);
      this.logger.log(`Python AI service response data: ${JSON.stringify({ 
        recommendations_count: response.data?.recommendations?.length || 0 
      })}`);
      
      if (!response.data || !response.data.recommendations) {
        this.logger.warn('Python AI service returned invalid response structure');
        return { recommendations: [] };
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        this.logger.error(`Python AI service error: ${error.response.status} - ${error.response.data}`);
        throw new HttpException(
          `AI service error: ${error.response.data?.detail || 'Unknown error'}`,
          error.response.status || HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.request) {
        this.logger.error('Python AI service timeout or connection error');
        throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      } else {
        this.logger.error('Error calling Python AI service:', error.message);
        throw new HttpException('Failed to call AI service', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Apply OpenAI second-layer validation and explanation
   */
  private async applyOpenAIValidation(
    profile: any,
    preferences: any,
    allPrograms: ProgramWithUniversity[],
    mlRecommendations: Array<{ program_id: number; score: number }>,
    studentProfile?: StudentProfileData,
    fieldPredictions?: Array<{ field_name: string; probability: number }>,
  ): Promise<FinalRecommendationDto[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Get top N recommendations (e.g., top 10)
    const topN = Math.min(10, mlRecommendations.length);
    const topRecommendations = mlRecommendations.slice(0, topN);

      // Map program IDs to full program data
      const programMap = new Map(allPrograms.map((p) => [p.id, p]));
      const topPrograms = topRecommendations
        .map((rec) => programMap.get(rec.program_id))
        .filter((p): p is ProgramWithUniversity => p !== undefined);

    // Build student summary
    const studentSummary = this.buildStudentSummary(profile, preferences);

      // Build program summaries
      const programSummaries = topPrograms.map((p) => {
        // Calculate duration_months from duration string if needed
        let durationMonths: number | undefined;
        if (p.duration) {
          const durationStr = p.duration.toLowerCase();
          if (durationStr.includes('year')) {
            const years = parseFloat(durationStr);
            if (!isNaN(years)) {
              durationMonths = Math.round(years * 12);
            }
          } else if (durationStr.includes('month')) {
            const months = parseFloat(durationStr);
            if (!isNaN(months)) {
              durationMonths = Math.round(months);
            }
          }
        }

        return {
          id: p.id,
          name: p.name,
          university: p.university?.name || 'Unknown',
          location: p.university?.state || 'Unknown',
          level: p.level || 'Unknown',
          field_id: p.field_id,
          tuition: p.tuition_fee ? `RM ${p.tuition_fee.toLocaleString()}` : 'Not specified',
          duration: durationMonths ? `${durationMonths} months` : (p.duration || 'Not specified'),
          description: p.description ? p.description.substring(0, 200) : 'No description',
        };
      });

    // Build field context for OpenAI
    const fieldContext = fieldPredictions && fieldPredictions.length > 0
      ? `\n\n**Field Interest Analysis:**\nThe student's profile indicates strongest interest in:\n${fieldPredictions.slice(0, 3).map((f, idx) => `  ${idx + 1}. ${f.field_name} (${(f.probability * 100).toFixed(1)}% match)`).join('\n')}\n\nPrograms are filtered to these top fields to ensure relevance.`
      : '';

    const systemPrompt = `You are an academic advisor helping Malaysian students find suitable university programs. Your role is to VALIDATE, RE-RANK, and EXPLAIN ML model recommendations.

**Your Guidelines:**
- Review the ML model's top recommendations and their scores
- VALIDATE if the ranking makes sense given the student's profile and field interests
- RE-RANK if needed (e.g., if Program A has similar score to Program B but Program A better matches budget/location/field)
- EXPLAIN WHY Program A is ranked higher than Program B (highlight differences: fees, outcomes, duration, location, field alignment)
- FLAG weak matches if a program doesn't strongly align with student preferences or field interests
- Generate clear, natural language explanations that reference ACTUAL data (tuition, location, employment rate, field relevance)
- Be concise but specific (2-3 sentences per explanation)
- DO NOT hallucinate information not provided
- DO NOT make admissions guarantees
${fieldContext}

**Critical Validation Tasks:**
1. Compare similar-scoring programs and explain why one ranks higher
2. Identify if budget constraints are properly reflected in ranking
3. Check if location preferences are considered
4. Verify field/level matches are prioritized
5. Validate that programs align with the student's field interests
6. Flag any recommendations that seem weak or questionable

**Output Format:**
Return a JSON array of recommendations, each with:
- program_id: The program ID (use the EXACT ID from the program list, NOT position numbers)
- reason: A detailed explanation (2-3 sentences) explaining:
  * Why this program matches the student's field interests and profile
  * How it compares to other similar programs
  * Specific factors (budget, location, employment, rating, field alignment) that make it suitable

Sort by relevance (most suitable first).`;

    // Get ML scores for each program
    const scoreMap = new Map(mlRecommendations.map(r => [r.program_id, r.score]));
    
    const userPrompt = `Student Profile:
${studentSummary}

Top ML Recommendations with Scores (in order):
${programSummaries.map((p, idx) => {
  const mlScore = scoreMap.get(p.id) || 0;
  return `Position ${idx + 1}: ${p.name} (Program ID: ${p.id}) at ${p.university}, ${p.location}
   - ML Match Score: ${(mlScore * 100).toFixed(1)}%
   - Level: ${p.level}
   - Field ID: ${p.field_id}
   - Tuition: ${p.tuition}
   - Duration: ${p.duration}
   - Description: ${p.description}`;
}).join('\n\n')}

**Your Task:**
1. VALIDATE the ranking - does it make sense? Should any programs be re-ranked?
2. For each program, explain WHY it's recommended and HOW it compares to similar programs
3. Highlight key differences: tuition fees, location, employment prospects, program quality
4. If two programs have similar scores, explain what makes one better than the other

IMPORTANT: When returning program_id in your JSON response, you MUST use the exact Program ID shown above (e.g., ${programSummaries[0]?.id || 'N/A'}), NOT the position number (1, 2, 3...).

Return as JSON array:
[
  {"program_id": ${programSummaries[0]?.id || 0}, "reason": "Matches budget (${programSummaries[0]?.tuition || 'N/A'}), preferred location (${programSummaries[0]?.location || 'N/A'}), and accounting field focus. Higher employment rate compared to similar programs."},
  ...
]`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response - OpenAI may return JSON wrapped in markdown or plain JSON
      let parsed: any;
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          parsed = JSON.parse(content);
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse OpenAI response as JSON, using fallback');
        // Fallback: create recommendations from ML results
        // Fallback: need to get allPrograms and studentProfile from context
        // For now, return basic format - this is a fallback case
        return topRecommendations.map((rec, index) => ({
          program_id: rec.program_id,
          rank: index + 1,
          match_score: rec.score,
          explanation: `Recommended with ${(rec.score * 100).toFixed(0)}% confidence based on your profile.`,
          reasons: [`ML model confidence: ${(rec.score * 100).toFixed(0)}%`],
        }));
      }

      const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];

      // CRITICAL FIX: OpenAI might return wrong program IDs (like 1, 2, 3 instead of actual IDs)
      // Map OpenAI's response back to actual program IDs from ML recommendations by position
      // Since we send programs in order, OpenAI's response should match that order
      return recommendations.map((rec: any, index: number) => {
        // Get the actual program ID from the original ML recommendations by position
        let actualProgramId: number;
        
        if (index < topRecommendations.length) {
          // Use position-based mapping (most reliable)
          actualProgramId = topRecommendations[index].program_id;
          
          // Log if OpenAI returned a different ID
          if (rec.program_id && rec.program_id !== actualProgramId) {
            this.logger.warn(
              `OpenAI returned program_id ${rec.program_id} at position ${index + 1}, but actual ID is ${actualProgramId}. Using actual ID.`
            );
          }
        } else {
          // Index out of bounds - skip this recommendation
          this.logger.error(`OpenAI returned more recommendations (${recommendations.length}) than we sent (${topRecommendations.length})`);
          return null;
        }

        // Get the original ML score for this program
        const mlRec = topRecommendations.find(r => r.program_id === actualProgramId);
        const matchScore = mlRec?.score;
        
        // Get program details for explainability
        const programMap = new Map(allPrograms.map(p => [p.id, p]));
        const program = programMap.get(actualProgramId);
        
        // Combine OpenAI explanation with structured reasons
        const openAIReason = rec.reason || 'Recommended based on your profile and preferences.';
        const structuredReasons = program && studentProfile
          ? this.generateExplainabilityReasons(program, studentProfile)
          : [];
        
        // Merge OpenAI explanation with structured reasons
        const allReasons = structuredReasons.length > 0 
          ? [...structuredReasons, openAIReason]
          : [openAIReason];
        
        return {
          program_id: actualProgramId,
          rank: index + 1,
          match_score: matchScore,
          explanation: openAIReason,
          reasons: structuredReasons.length > 0 ? structuredReasons : [openAIReason],
        };
      }).filter((rec): rec is FinalRecommendationDto => rec !== null);
    } catch (error: any) {
      this.logger.error('OpenAI validation error:', error);
      throw error;
    }
  }

  /**
   * Build student summary for OpenAI prompt
   */
  private buildStudentSummary(profile: any, preferences: any): string {
    const parts: string[] = [];

    if (profile?.study_level) {
      parts.push(`Study Level: ${profile.study_level}`);
    }

    if (preferences?.budget_range) {
      parts.push(`Budget: ${preferences.budget_range}`);
    }

    if (preferences?.preferred_location) {
      parts.push(`Preferred Location: ${preferences.preferred_location}`);
    }

    const cgpa = this.calculateCGPA(profile);
    if (cgpa) {
      parts.push(`Estimated CGPA: ${cgpa.toFixed(2)}`);
    }

    return parts.join('\n') || 'Student profile information available.';
  }

  /**
   * Apply post-processing rules to reduce similarity and improve differentiation
   * STEP 5: Post-processing rules
   */
  private applyPostProcessingRules(
    mlRecommendations: Array<{ program_id: number; score: number }>,
    allPrograms: ProgramWithUniversity[],
    studentProfile: StudentProfileData,
  ): Array<{ program_id: number; score: number }> {
    const programMap = new Map(allPrograms.map(p => [p.id, p]));
    
    return mlRecommendations.map(rec => {
      const program = programMap.get(rec.program_id);
      if (!program) return rec;
      
      let adjustedScore = rec.score;
      
      // Rule 1: Penalize programs exceeding budget by >10%
      if (studentProfile.budget && program.tuition_fee) {
        const budgetExcess = (program.tuition_fee - studentProfile.budget) / studentProfile.budget;
        if (budgetExcess > 0.1) {
          // Penalize: reduce score by excess percentage (capped at 30% reduction)
          const penalty = Math.min(budgetExcess * 0.3, 0.3);
          adjustedScore = adjustedScore * (1 - penalty);
          this.logger.debug(`Program ${rec.program_id}: Budget penalty ${(penalty * 100).toFixed(1)}% (exceeds by ${(budgetExcess * 100).toFixed(1)}%)`);
        }
      }
      
      // Rule 2: Boost higher employment rate
      if (program.employment_rate) {
        if (program.employment_rate >= 90) {
          adjustedScore = adjustedScore * 1.1; // 10% boost
        } else if (program.employment_rate >= 80) {
          adjustedScore = adjustedScore * 1.05; // 5% boost
        }
      }
      
      // Rule 3: Boost closer location match
      if (studentProfile.preferredStates && program.university?.state) {
        const stateMatch = studentProfile.preferredStates.some(
          state => state.toLowerCase() === program.university?.state?.toLowerCase()
        );
        if (stateMatch) {
          adjustedScore = adjustedScore * 1.08; // 8% boost
        }
      }
      
      // Rule 4: Boost higher rating
      if (program.rating) {
        if (program.rating >= 4.5) {
          adjustedScore = adjustedScore * 1.05; // 5% boost
        } else if (program.rating >= 4.0) {
          adjustedScore = adjustedScore * 1.02; // 2% boost
        }
      }
      
      // Ensure score stays within [0, 1] range
      adjustedScore = Math.min(Math.max(adjustedScore, 0), 1);
      
      return {
        program_id: rec.program_id,
        score: adjustedScore,
      };
    }).sort((a, b) => b.score - a.score); // Re-sort by adjusted scores
  }

  /**
   * Generate explainability metadata (reasons) for a recommendation
   * STEP 3: Explainability metadata
   */
  private generateExplainabilityReasons(
    program: ProgramWithUniversity,
    studentProfile: StudentProfileData,
  ): string[] {
    const reasons: string[] = [];
    
    // Field match
    if (studentProfile.fieldIds && studentProfile.fieldIds.length > 0) {
      if (program.field_id && studentProfile.fieldIds.includes(program.field_id)) {
        reasons.push('Matches your preferred field of interest');
      }
    }
    
    // Level match
    if (studentProfile.studyLevel && program.level) {
      const levelMatch = this.normalizeLevel(studentProfile.studyLevel) === this.normalizeLevel(program.level);
      if (levelMatch) {
        reasons.push(`Matches ${program.level} level preference`);
      }
    }
    
    // Budget match
    if (studentProfile.budget && program.tuition_fee) {
      if (program.tuition_fee <= studentProfile.budget) {
        reasons.push('Within your tuition budget');
      } else if (program.tuition_fee <= studentProfile.budget * 1.1) {
        reasons.push('Slightly above budget (within 10%)');
      }
    }
    
    // Location match
    if (studentProfile.preferredStates && program.university?.state) {
      const stateMatch = studentProfile.preferredStates.some(
        state => state.toLowerCase() === program.university?.state?.toLowerCase()
      );
      if (stateMatch) {
        reasons.push(`Located in preferred state: ${program.university.state}`);
      }
    }
    
    // Employment rate
    if (program.employment_rate) {
      if (program.employment_rate >= 90) {
        reasons.push('High employment rate (90%+)');
      } else if (program.employment_rate >= 80) {
        reasons.push('Good employment rate (80%+)');
      }
    }
    
    // Rating
    if (program.rating) {
      if (program.rating >= 4.5) {
        reasons.push('Excellent program rating (4.5+)');
      } else if (program.rating >= 4.0) {
        reasons.push('High program rating (4.0+)');
      }
    }
    
    // Average salary
    if (program.average_salary) {
      if (program.average_salary >= 5000) {
        reasons.push('High average graduate salary');
      }
    }
    
    // Default reason if no specific matches
    if (reasons.length === 0) {
      reasons.push('Recommended based on overall profile match');
    }
    
    return reasons;
  }

  /**
   * Normalize level string for comparison
   */
  private normalizeLevel(level: string): string {
    if (!level) return '';
    const lower = level.toLowerCase();
    if (lower.includes('bachelor') || lower.includes('degree')) return 'bachelor';
    if (lower.includes('diploma')) return 'diploma';
    if (lower.includes('foundation')) return 'foundation';
    return lower;
  }

  /**
   * Convert ML recommendations to final format with explainability
   * Enhanced version with match scores and reasons
   */
  private convertMLToFinalRecommendations(
    mlRecommendations: Array<{ program_id: number; score: number }>,
    allPrograms: ProgramWithUniversity[],
    studentProfile: StudentProfileData,
  ): FinalRecommendationDto[] {
    const programMap = new Map(allPrograms.map(p => [p.id, p]));
    
    return mlRecommendations.map((rec, index) => {
      const program = programMap.get(rec.program_id);
      const reasons = program 
        ? this.generateExplainabilityReasons(program, studentProfile)
        : ['Recommended based on your profile'];
      
      return {
        program_id: rec.program_id,
        rank: index + 1,
        match_score: rec.score,
        explanation: reasons.join('. ') + '.',
        reasons: reasons,
      };
    });
  }

  /**
   * Use OpenAI to validate and refine ML model's field predictions
   * This provides a second layer of validation to ensure accuracy
   */
  private async validateFieldsWithOpenAI(
    profile: any,
    preferences: any,
    mlFieldPredictions: Array<{ field_name: string; probability: number }>,
  ): Promise<Array<{ field_name: string; probability: number }>> {
    if (!this.openai) {
      this.logger.warn('OpenAI client not initialized, skipping validation');
      return mlFieldPredictions;
    }

    try {
      // Build student summary for OpenAI
      const studentSummary = this.buildFieldValidationStudentSummary(profile, preferences);

      // Build field predictions summary
      const fieldsSummary = mlFieldPredictions.map((f, idx) => ({
        rank: idx + 1,
        field_name: f.field_name,
        ml_confidence: (f.probability * 100).toFixed(2) + '%',
      }));

      const systemPrompt = `You are an academic advisor helping Malaysian students validate field of interest recommendations from an ML model.

**Your Task:**
1. Review the ML model's top 5 field predictions and their confidence scores
2. VALIDATE if the ranking makes sense given the student's profile:
   - Subject strengths (grades in Mathematics, ICT, Physics, Chemistry, etc.)
   - Interests (Computer, Science, Business, Arts, etc.)
   - Skills (Logical thinking, Problem solving, Creativity, etc.)
   - Academic level (SPM/STPM)
   - Extracurricular activities
3. RE-RANK if needed:
   - If a field with lower ML confidence actually better matches the student's profile, boost it
   - If a field with high ML confidence doesn't align well, reduce it
   - Consider: Does the student have strong grades in relevant subjects?
   - Consider: Does the student have high interest in this field?
   - Consider: Does the student have relevant skills for this field?
4. FLAG mismatches: If a field seems completely wrong (e.g., Agriculture at 97% but student has high Computer interest and ICT grade), significantly reduce its probability

**Important:**
- You MUST return exactly 5 fields (the same fields provided)
- You can re-rank them and adjust probabilities
- Probabilities should still be between 0 and 1
- The sum of probabilities should be reasonable (doesn't need to be exactly 1, but should be proportional)
- Focus on semantic alignment: Does the field match the student's academic strengths and interests?

**Output Format:**
Return a JSON object with this exact structure:
{
  "validated_fields": [
    {
      "field_name": "Computer Science & IT",
      "adjusted_probability": 0.65,
      "reason": "Strong match: Student has high Computer interest (5/5), ICT grade (A), strong Logical thinking and Problem solving skills. ML model may have underweighted these factors."
    },
    ...
  ],
  "confidence_note": "Validated and re-ranked based on subject strengths, interests, and skills alignment."
}

Return ONLY the JSON, no other text.`;

      const userPrompt = `Student Profile:
${studentSummary}

ML Model Predictions (Top 5):
${fieldsSummary.map(f => `  ${f.rank}. ${f.field_name}: ${f.ml_confidence} confidence`).join('\n')}

Please validate these predictions and provide adjusted probabilities with explanations.`;

      this.logger.log('Calling OpenAI for field validation...');
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent validation
        max_tokens: 1500,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      this.logger.log('OpenAI response received');
      this.logger.debug(`OpenAI raw response: ${responseText}`);

      // Parse JSON response
      let parsedResponse: any;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : responseText;
        parsedResponse = JSON.parse(jsonText.trim());
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI response as JSON:', parseError);
        this.logger.error(`Response text: ${responseText}`);
        return mlFieldPredictions; // Fallback to ML results
      }

      if (!parsedResponse.validated_fields || !Array.isArray(parsedResponse.validated_fields)) {
        this.logger.warn('OpenAI response missing validated_fields array, using ML results');
        return mlFieldPredictions;
      }

      // Map OpenAI's validated fields back to our format
      const validatedFields = parsedResponse.validated_fields.map((vf: any) => {
        // Find the original field to preserve field_name exactly
        const originalField = mlFieldPredictions.find(f => 
          f.field_name.toLowerCase() === vf.field_name?.toLowerCase()
        );
        
        if (!originalField) {
          this.logger.warn(`OpenAI returned unknown field: ${vf.field_name}, skipping`);
          return null;
        }

        return {
          field_name: originalField.field_name, // Use original field name
          probability: Math.max(0, Math.min(1, parseFloat(vf.adjusted_probability) || originalField.probability)),
        };
      }).filter((f: any): f is { field_name: string; probability: number } => f !== null);

      // Ensure we have exactly 5 fields (add missing ones from ML predictions)
      const validatedFieldNames = new Set(validatedFields.map(f => f.field_name.toLowerCase()));
      for (const mlField of mlFieldPredictions) {
        if (!validatedFieldNames.has(mlField.field_name.toLowerCase())) {
          validatedFields.push(mlField);
        }
      }

      // Sort by adjusted probability descending
      validatedFields.sort((a, b) => b.probability - a.probability);

      // Log validation results
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[OPENAI VALIDATION] Field predictions after OpenAI validation:');
      this.logger.log('═══════════════════════════════════════════════════════════');
      validatedFields.forEach((f, idx) => {
        const original = mlFieldPredictions.find(mf => mf.field_name === f.field_name);
        const originalProb = original ? (original.probability * 100).toFixed(2) : 'N/A';
        const newProb = (f.probability * 100).toFixed(2);
        const change = original ? ((f.probability - original.probability) * 100).toFixed(2) : 'N/A';
        this.logger.log(`  ${idx + 1}. ${f.field_name}: ${newProb}% (was ${originalProb}%, change: ${change}%)`);
      });
      if (parsedResponse.confidence_note) {
        this.logger.log(`Note: ${parsedResponse.confidence_note}`);
      }
      this.logger.log('═══════════════════════════════════════════════════════════');

      return validatedFields.slice(0, 5); // Ensure exactly 5 fields
    } catch (error: any) {
      this.logger.error('OpenAI field validation error:', error);
      this.logger.error('Error details:', error.message);
      // Fallback to ML model results
      return mlFieldPredictions;
    }
  }

  /**
   * Build a student summary for field validation
   */
  private buildFieldValidationStudentSummary(profile: any, preferences: any): string {
    const parts: string[] = [];

    // Academic Level
    if (profile.study_level) {
      parts.push(`Academic Level: ${profile.study_level}`);
    }

    // Subject Grades (key subjects for field matching)
    const gradeFields = [
      { key: 'mathematics', label: 'Mathematics' },
      { key: 'ict', label: 'ICT' },
      { key: 'physics', label: 'Physics' },
      { key: 'chemistry', label: 'Chemistry' },
      { key: 'biology', label: 'Biology' },
      { key: 'additional_mathematics', label: 'Additional Mathematics' },
      { key: 'accounting', label: 'Accounting' },
      { key: 'economics', label: 'Economics' },
    ];

    const grades = gradeFields
      .filter(f => profile[f.key] && profile[f.key] !== '0' && profile[f.key] !== '')
      .map(f => `${f.label}: ${profile[f.key]}`)
      .join(', ');

    if (grades) {
      parts.push(`Subject Grades: ${grades}`);
    }

    // Interests
    const interestFields = [
      { key: 'computer_interest', label: 'Computer' },
      { key: 'maths_interest', label: 'Mathematics' },
      { key: 'science_interest', label: 'Science' },
      { key: 'business_interest', label: 'Business' },
      { key: 'art_interest', label: 'Arts' },
      { key: 'writing_interest', label: 'Writing' },
      { key: 'social_interest', label: 'Social' },
    ];

    const interests = interestFields
      .filter(f => profile[f.key] && profile[f.key] > 0)
      .map(f => `${f.label}: ${profile[f.key]}/5`)
      .join(', ');

    if (interests) {
      parts.push(`Interests (1-5 scale): ${interests}`);
    }

    // Skills
    const skillFields = [
      { key: 'logical_thinking', label: 'Logical Thinking' },
      { key: 'problem_solving', label: 'Problem Solving' },
      { key: 'creativity', label: 'Creativity' },
      { key: 'communication', label: 'Communication' },
      { key: 'teamwork', label: 'Teamwork' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'attention_to_detail', label: 'Attention to Detail' },
    ];

    const skills = skillFields
      .filter(f => profile[f.key] && profile[f.key] > 0)
      .map(f => `${f.label}: ${profile[f.key]}/5`)
      .join(', ');

    if (skills) {
      parts.push(`Skills (1-5 scale): ${skills}`);
    }

    // Extracurricular
    if (profile.extracurricular !== undefined) {
      parts.push(`Extracurricular Activities: ${profile.extracurricular ? 'Yes' : 'No'}`);
    }

    // Budget (if available)
    if (preferences?.tuition_budget) {
      parts.push(`Budget: RM ${preferences.tuition_budget.toLocaleString()}`);
    }

    return parts.join('\n');
  }

  /**
   * Save field recommendations to database
   */
  private async saveFieldRecommendations(
    userId: string,
    normalizedFields: Array<{ field_name: string; probability: number }>,
    validatedFields: Array<{ field_name: string; probability: number }>,
    mlFields: Array<{ field_name: string; probability: number }>,
    poweredBy: string[],
  ): Promise<string> {
    try {
      const db = this.supabaseService.getClient();
      const sessionId = crypto.randomUUID();

      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[SAVE] Saving field recommendations to database');
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(`User ID: ${userId}`);
      this.logger.log(`Fields to save: ${normalizedFields.length}`);

      // Get field IDs for all fields
      const fieldNames = normalizedFields.map(f => f.field_name);
      const { data: fieldData, error: fieldError } = await db
        .from('field_of_interest')
        .select('id, name')
        .in('name', fieldNames);

      if (fieldError) {
        this.logger.error('Error fetching field IDs:', fieldError);
        throw new Error(`Failed to fetch field IDs: ${fieldError.message}`);
      }

      const fieldNameToIdMap = new Map<string, number>();
      if (fieldData) {
        fieldData.forEach(field => {
          fieldNameToIdMap.set(field.name.toLowerCase(), field.id);
        });
        this.logger.log(`Mapped ${fieldData.length} field names to IDs`);
      }

      // Prepare recommendations for insertion
      const recommendations = normalizedFields.map((field, index) => {
        const fieldId = fieldNameToIdMap.get(field.field_name.toLowerCase());
        const mlField = mlFields.find(f => f.field_name === field.field_name);
        const validatedField = validatedFields.find(f => f.field_name === field.field_name);

        return {
          user_id: userId,
          recommendation_type: 'field' as const,
          field_of_interest_id: fieldId || null,
          field_name: field.field_name,
          program_id: null,
          program_name: null,
          ml_confidence_score: mlField?.probability || field.probability,
          ml_rank: mlFields.findIndex(f => f.field_name === field.field_name) + 1,
          openai_validated: poweredBy.includes('OpenAI Validation'),
          openai_adjusted_score: validatedField?.probability || null,
          openai_explanation: null, // Field recommendations don't have explanations yet
          final_rank: index + 1,
          final_score: field.probability,
          powered_by: poweredBy,
          recommendation_session_id: sessionId,
        };
      });

      this.logger.log(`Prepared ${recommendations.length} recommendations for insertion`);

      // Insert recommendations
      const { data, error } = await db
        .from('ai_recommendations')
        .insert(recommendations)
        .select('recommendation_id');

      if (error) {
        this.logger.error('Error inserting field recommendations:', error);
        this.logger.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to insert field recommendations: ${error.message}`);
      }

      this.logger.log(`✅ Successfully inserted ${data?.length || 0} field recommendations`);
      this.logger.log('═══════════════════════════════════════════════════════════');

      return sessionId;
    } catch (error: any) {
      this.logger.error('Error saving field recommendations:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Save program recommendations to database
   */
  private async saveProgramRecommendations(
    userId: string,
    fieldId: number,
    fieldName: string,
    validatedPrograms: FinalRecommendationDto[],
    mlRecommendations: Array<{ program_id: number; score: number }>,
    poweredBy: string[],
  ): Promise<void> {
    try {
      const db = this.supabaseService.getClient();
      const sessionId = crypto.randomUUID();

      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('[SAVE] Saving program recommendations to database');
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(`User ID: ${userId}`);
      this.logger.log(`Field: ${fieldName} (ID: ${fieldId})`);
      this.logger.log(`Programs to save: ${validatedPrograms.length}`);

      // Get program details for names
      const programIds = validatedPrograms.map(p => p.program_id);
      const allPrograms = await this.programsService.getPrograms(false);
      const programMap = new Map(allPrograms.map(p => [p.id, p]));

      // Prepare recommendations for insertion
      const recommendations = validatedPrograms.map((rec) => {
        const program = programMap.get(rec.program_id);
        const mlRec = mlRecommendations.find(r => r.program_id === rec.program_id);

        return {
          user_id: userId,
          recommendation_type: 'program' as const,
          field_of_interest_id: fieldId,
          field_name: fieldName,
          program_id: rec.program_id,
          program_name: program?.name || null,
          ml_confidence_score: mlRec?.score || rec.match_score || 0,
          ml_rank: mlRecommendations.findIndex(r => r.program_id === rec.program_id) + 1,
          openai_validated: poweredBy.includes('OpenAI Validation'),
          openai_adjusted_score: rec.match_score || null,
          openai_explanation: rec.explanation || null,
          final_rank: rec.rank,
          final_score: rec.match_score || mlRec?.score || 0,
          powered_by: poweredBy,
          recommendation_session_id: sessionId,
        };
      });

      this.logger.log(`Prepared ${recommendations.length} program recommendations for insertion`);

      // Insert recommendations
      const { data, error } = await db
        .from('ai_recommendations')
        .insert(recommendations)
        .select('recommendation_id');

      if (error) {
        this.logger.error('Error inserting program recommendations:', error);
        this.logger.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to insert program recommendations: ${error.message}`);
      }

      this.logger.log(`✅ Successfully inserted ${data?.length || 0} program recommendations`);
      this.logger.log('═══════════════════════════════════════════════════════════');
    } catch (error: any) {
      this.logger.error('Error saving program recommendations:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Get recommendation history for a user
   */
  async getRecommendationHistory(
    userId: string,
    type?: 'field' | 'program',
    limit: number = 50,
  ) {
    try {
      const db = this.supabaseService.getClient();
      
      let query = db
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('recommendation_type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch recommendation history: ${error.message}`);
      }

      // Type assertion to match the expected return type
      return (data || []) as Array<{
        recommendation_id: string;
        recommendation_type: 'field' | 'program';
        field_of_interest_id: number | null;
        field_name: string | null;
        program_id: number | null;
        program_name: string | null;
        ml_confidence_score: number;
        openai_validated: boolean;
        openai_adjusted_score: number | null;
        final_rank: number | null;
        final_score: number | null;
        powered_by: string[] | null;
        created_at: string | null;
        recommendation_session_id: string | null;
      }>;
    } catch (error: any) {
      this.logger.error('Error fetching recommendation history:', error);
      throw error;
    }
  }
}

