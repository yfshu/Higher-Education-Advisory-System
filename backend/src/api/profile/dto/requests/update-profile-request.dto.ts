import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export type SubjectGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'G' | '0';

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({ enum: ['SPM', 'STPM'] })
  @IsOptional()
  @IsEnum(['SPM', 'STPM'])
  studyLevel?: 'SPM' | 'STPM';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  extracurricular?: boolean;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  bm?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  english?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  history?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  mathematics?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  islamicEducationMoralEducation?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  physics?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  chemistry?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  biology?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  additionalMathematics?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  geography?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  economics?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  accounting?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  chinese?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  tamil?: SubjectGrade;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  ict?: SubjectGrade;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  mathsInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  scienceInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  computerInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  writingInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  artInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  businessInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  socialInterest?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  logicalThinking?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  problemSolving?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  creativity?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  communication?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  teamwork?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  leadership?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  attentionToDetail?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studyMode?: string;
}

