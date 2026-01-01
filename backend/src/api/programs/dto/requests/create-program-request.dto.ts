import { IsString, IsNumber, IsOptional, IsEnum, IsObject, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramRequestDto {
  @ApiProperty({ description: 'Program name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'University ID', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  university_id?: number | null;

  @ApiPropertyOptional({ 
    description: 'Program level',
    enum: ['Foundation', 'Diploma', 'Bachelor'],
  })
  @IsOptional()
  @IsEnum(['Foundation', 'Diploma', 'Bachelor'])
  level?: 'Foundation' | 'Diploma' | 'Bachelor' | null;

  @ApiPropertyOptional({ description: 'Program description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Duration in months', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  duration_months?: number | null;

  @ApiPropertyOptional({ description: 'Tuition fee amount', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tuition_fee_amount?: number | null;

  @ApiPropertyOptional({ 
    description: 'Tuition fee period',
    enum: ['semester', 'year', 'total'],
  })
  @IsOptional()
  @IsEnum(['semester', 'year', 'total'])
  tuition_fee_period?: string | null;

  @ApiPropertyOptional({ description: 'Currency code (e.g., MYR)', default: 'MYR' })
  @IsOptional()
  @IsString()
  currency?: string | null;

  @ApiPropertyOptional({ description: 'Start month' })
  @IsOptional()
  @IsString()
  start_month?: string | null;

  @ApiPropertyOptional({ description: 'Application deadline' })
  @IsOptional()
  @IsString()
  deadline?: string | null;

  @ApiPropertyOptional({ description: 'Field of interest ID', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  field_id?: number | null;

  @ApiPropertyOptional({ description: 'Entry requirements (JSONB)' })
  @IsOptional()
  @IsObject()
  entry_requirements?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Curriculum (JSONB)' })
  @IsOptional()
  @IsObject()
  curriculum?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Career outcomes (JSONB)' })
  @IsOptional()
  @IsObject()
  career_outcomes?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Facilities (JSONB)' })
  @IsOptional()
  @IsObject()
  facilities?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Tags (JSONB array)' })
  @IsOptional()
  @IsArray()
  tags?: string[] | null;

  @ApiPropertyOptional({ description: 'Program status', enum: ['active', 'draft', 'archived'] })
  @IsOptional()
  @IsEnum(['active', 'draft', 'archived'])
  status?: 'active' | 'draft' | 'archived' | null;

  @ApiPropertyOptional({ description: 'Rating', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number | null;

  @ApiPropertyOptional({ description: 'Review count', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  review_count?: number | null;

  @ApiPropertyOptional({ description: 'Employment rate', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  employment_rate?: number | null;

  @ApiPropertyOptional({ description: 'Average salary', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  average_salary?: number | null;

  @ApiPropertyOptional({ description: 'Satisfaction rate', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  satisfaction_rate?: number | null;

  @ApiPropertyOptional({ description: 'Duration (text format, e.g., "3 years")' })
  @IsOptional()
  @IsString()
  duration?: string | null;

  @ApiPropertyOptional({ description: 'Tuition fee (legacy field)', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tuition_fee?: number | null;

  @ApiPropertyOptional({ description: 'Entry requirements (legacy text field)' })
  @IsOptional()
  @IsString()
  entry_requirements_old?: string | null;
}

