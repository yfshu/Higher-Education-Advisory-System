import { ApiProperty } from '@nestjs/swagger';

export class FieldRecommendationDto {
  @ApiProperty({ example: 'Computer Science & IT' })
  field_name: string;

  @ApiProperty({ example: 0.6509, description: 'Interest score between 0 and 1' })
  probability: number;
}

export class FieldRecommendationResponseDto {
  @ApiProperty({ type: [FieldRecommendationDto] })
  fields: FieldRecommendationDto[];

  @ApiProperty({
    example: ['ML Model'],
    description: 'List of AI systems used to generate field recommendations',
  })
  powered_by: string[];
}

