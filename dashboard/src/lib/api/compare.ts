/**
 * Compare API client
 * 
 * Handles comparison-related API calls to the backend
 */

import { apiCall } from '@/lib/auth/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export interface CompareProgramData {
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

export interface AIExplanationResponse {
  success: boolean;
  summary: string;
}

/**
 * Generate AI explanation comparing two programs
 */
export async function generateAIExplanation(
  programA: CompareProgramData,
  programB: CompareProgramData,
): Promise<{ data: AIExplanationResponse | null; error: string | null }> {
  const result = await apiCall<AIExplanationResponse>(
    `${BACKEND_URL}/api/compare/ai-explain`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programA,
        programB,
      }),
    }
  );

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to generate AI explanation',
    };
  }

  return {
    data: result.data,
    error: null,
  };
}

