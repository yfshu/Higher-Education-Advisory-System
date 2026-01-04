/**
 * AI Recommendations API client
 * 
 * Handles AI recommendation-related API calls to the backend
 */

import { apiCall } from '@/lib/auth/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export interface FieldRecommendation {
  field_name: string;
  probability: number;
}

export interface FieldRecommendationResponse {
  fields: FieldRecommendation[];
  powered_by: string[];
}

export interface ProgramRecommendation {
  program_id: number;
  rank: number;
  explanation: string;
  match_score?: number;
  reasons?: string[];
}

export interface ProgramRecommendationResponse {
  recommendations: ProgramRecommendation[];
  powered_by: string[];
}

/**
 * Get field-level recommendations (STEP 1)
 * Returns ranked field categories based on student profile
 */
export async function getFieldRecommendations(): Promise<{
  data: FieldRecommendationResponse | null;
  error: string | null;
}> {
  const result = await apiCall<FieldRecommendationResponse>(
    `${BACKEND_URL}/api/ai/recommend/fields`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to get field recommendations',
    };
  }

  return {
    data: result.data,
    error: null,
  };
}

/**
 * Get top 3 programs for selected field (STEP 2)
 * Returns top 3 most suitable programs using OpenAI analysis
 */
export async function getProgramsByField(fieldName: string): Promise<{
  data: ProgramRecommendationResponse | null;
  error: string | null;
}> {
  const result = await apiCall<ProgramRecommendationResponse>(
    `${BACKEND_URL}/api/ai/recommend/programs-by-field`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        field_name: fieldName,
      }),
    }
  );

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to get program recommendations',
    };
  }

  return {
    data: result.data,
    error: null,
  };
}

export interface RecommendationHistoryItem {
  recommendation_id: string;
  recommendation_type: 'field' | 'program';
  field_of_interest_id: number | null;
  field_name: string | null;
  program_id: number | null;
  program_name: string | null;
  ml_confidence_score: number;
  openai_validated: boolean;
  openai_adjusted_score: number | null;
  openai_explanation: string | null;
  final_rank: number | null;
  final_score: number | null;
  powered_by: string[] | null;
  created_at: string | null;
  recommendation_session_id: string | null;
}

export interface RecommendationHistoryResponse {
  success: boolean;
  data: RecommendationHistoryItem[];
  count: number;
}

/**
 * Get AI recommendation history
 * Returns the history of AI-generated field and program recommendations
 */
export async function getRecommendationHistory(
  type?: 'field' | 'program',
  limit?: number
): Promise<{
  data: RecommendationHistoryResponse | null;
  error: string | null;
}> {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (limit) params.append('limit', limit.toString());

  const result = await apiCall<RecommendationHistoryResponse>(
    `${BACKEND_URL}/api/ai/recommendations/history?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to get recommendation history',
    };
  }

  return {
    data: result.data,
    error: null,
  };
}

