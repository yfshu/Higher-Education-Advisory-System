import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinalRecommendationDto {
  @ApiProperty({ example: 37 })
  program_id: number;

  @ApiProperty({ example: 1, description: 'Ranking position (1 = best match)' })
  rank: number;

  @ApiProperty({
    example: 'Matches budget, preferred location, and accounting focus.',
    description: 'Natural language explanation of why this program is recommended',
  })
  explanation: string;

  @ApiPropertyOptional({
    example: 0.93,
    description: 'ML model match score (0-1)',
  })
  match_score?: number;

  @ApiPropertyOptional({
    example: ['Matches Accounting field', 'Within tuition budget', 'Degree level preferred'],
    description: 'List of specific reasons why this program matches',
    type: [String],
  })
  reasons?: string[];
}

export class FinalRecommendationResponseDto {
  @ApiProperty({ type: [FinalRecommendationDto] })
  recommendations: FinalRecommendationDto[];

  @ApiProperty({
    example: ['ML Model', 'OpenAI Validation'],
    description: 'List of AI systems used to generate recommendations',
  })
  powered_by: string[];
}

