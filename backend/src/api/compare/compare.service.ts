import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

interface ProgramData {
  id: number;
  name: string;
  level: string | null;
  duration: string | null;
  duration_months: number | null;
  tuition_fee_amount: number | null;
  tuition_fee_period: string | null;
  currency: string | null;
  start_month: string | null;
  deadline: string | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  entry_requirements: Record<string, any> | string | null;
  curriculum: any;
  career_outcomes: any;
  facilities: any;
  employment_rate: number | null;
  average_salary: number | null;
  satisfaction_rate: number | null;
  university: {
    id: number;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

@Injectable()
export class CompareService {
  private readonly logger = new Logger(CompareService.name);
  private readonly openai: OpenAI | null = null;
  private readonly cache = new Map<string, { summary: string; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized for compare service');
    } else {
      this.logger.warn('OPENAI_API_KEY not found - AI comparison will be unavailable');
    }
  }

  /**
   * Generate AI explanation comparing two programs
   */
  async generateComparisonExplanation(
    programA: ProgramData,
    programB: ProgramData,
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    // Check cache
    const cacheKey = `${programA.id}-${programB.id}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log(`Returning cached AI explanation for programs ${programA.id} and ${programB.id}`);
      return cached.summary;
    }

    try {
      // Format program data for comparison
      const programAFormatted = this.formatProgramForAI(programA);
      const programBFormatted = this.formatProgramForAI(programB);

      const systemPrompt = `You are an academic advisor helping Malaysian students compare two university programs objectively. Your role is to provide neutral, factual, and student-friendly guidance.

**Your Guidelines:**
- Be neutral and factual - do not favor one program over another
- Focus on objective differences and similarities
- Use student-friendly language
- Only discuss academic programs in Malaysia
- DO NOT make admissions guarantees
- DO NOT claim rankings or superiority
- DO NOT hallucinate information not provided
- Be concise but comprehensive

**Output Structure:**
Provide a clear comparison in the following sections:
1. Overview Comparison - Brief summary of both programs
2. Key Academic Differences - Curriculum, duration, entry requirements
3. Cost & Career Implications - Tuition, employment rates, salary expectations
4. Recommendation by Student Profile - Who each program suits better

Return as plain text (no markdown formatting).`;

      const userPrompt = `Compare these two Malaysian university programs:

PROGRAM A:
${programAFormatted}

PROGRAM B:
${programBFormatted}

Provide an objective comparison following the structure specified.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const summary = completion.choices[0]?.message?.content || 
        'Unable to generate comparison at this time. Please try again.';

      // Cache the result
      this.cache.set(cacheKey, {
        summary,
        timestamp: Date.now(),
      });

      this.logger.log(`AI explanation generated for programs ${programA.id} and ${programB.id}`);
      return summary;
    } catch (error) {
      this.logger.error('Error generating AI comparison:', error);
      throw new Error('Failed to generate AI comparison explanation');
    }
  }

  /**
   * Format program data for AI prompt
   */
  private formatProgramForAI(program: ProgramData): string {
    const parts: string[] = [];

    parts.push(`Program Name: ${program.name || 'Not specified'}`);
    parts.push(`University: ${program.university?.name || 'Not specified'}`);
    parts.push(`Location: ${program.university?.city || ''}${program.university?.state ? `, ${program.university.state}` : ''}, Malaysia`);
    parts.push(`Level: ${program.level || 'Not specified'}`);
    parts.push(`Duration: ${program.duration || program.duration_months ? `${program.duration_months} months` : 'Not specified'}`);
    
    if (program.tuition_fee_amount) {
      const currency = program.currency === 'MYR' ? 'RM' : program.currency || '';
      const period = program.tuition_fee_period || 'period';
      parts.push(`Tuition Fee: ${currency} ${program.tuition_fee_amount.toLocaleString()} per ${period}`);
    } else {
      parts.push(`Tuition Fee: Not specified`);
    }

    if (program.start_month) {
      parts.push(`Start Month: ${program.start_month}`);
    }

    if (program.deadline) {
      parts.push(`Application Deadline: ${program.deadline}`);
    }

    if (program.description) {
      parts.push(`Description: ${program.description.substring(0, 300)}${program.description.length > 300 ? '...' : ''}`);
    }

    if (program.entry_requirements) {
      try {
        const reqs = typeof program.entry_requirements === 'string' 
          ? JSON.parse(program.entry_requirements) 
          : program.entry_requirements;
        parts.push(`Entry Requirements: ${JSON.stringify(reqs)}`);
      } catch {
        parts.push(`Entry Requirements: ${program.entry_requirements}`);
      }
    }

    if (program.employment_rate) {
      parts.push(`Employment Rate: ${program.employment_rate}%`);
    }

    if (program.average_salary) {
      parts.push(`Average Salary: RM ${program.average_salary.toLocaleString()}/month`);
    }

    if (program.satisfaction_rate) {
      parts.push(`Graduate Satisfaction: ${program.satisfaction_rate}%`);
    }

    if (program.rating) {
      parts.push(`Rating: ${program.rating}/5 (${program.review_count || 0} reviews)`);
    }

    return parts.join('\n');
  }
}

