import { ApiProperty } from '@nestjs/swagger';

export class ProgramRecommendationDto {
  @ApiProperty({ example: 37 })
  program_id: number;

  @ApiProperty({ example: 0.91, description: 'Confidence score between 0 and 1' })
  score: number;
}

export class AIRecommendationResponseDto {
  @ApiProperty({ type: [ProgramRecommendationDto] })
  recommendations: ProgramRecommendationDto[];
}

