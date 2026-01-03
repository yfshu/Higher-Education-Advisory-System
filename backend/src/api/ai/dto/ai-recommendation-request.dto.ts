import { ApiProperty } from '@nestjs/swagger';

export class AIRecommendationRequestDto {
  @ApiProperty({
    description: 'Student profile data',
    example: {
      study_level: 'Bachelor',
      field_ids: [1, 3],
      cgpa: 3.2,
      budget: 50000,
      preferred_states: ['Selangor', 'Kuala Lumpur'],
    },
  })
  student_profile: {
    study_level: string;
    field_ids: number[];
    cgpa?: number;
    budget?: number;
    preferred_states?: string[];
  };

  @ApiProperty({
    description: 'List of candidate programs',
    example: [
      {
        program_id: 37,
        university_id: 5,
        field_id: 1,
        tuition_fee: 42000,
        duration_months: 36,
        level: 'Bachelor',
      },
    ],
  })
  programs: Array<{
    program_id: number;
    university_id: number;
    field_id: number;
    tuition_fee?: number;
    duration_months?: number;
    level: string;
  }>;
}

