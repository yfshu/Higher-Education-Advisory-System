import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SelectionProcessStepDto {
  @ApiProperty({ description: 'Step number', type: Number })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  step: number;

  @ApiProperty({ description: 'Step title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Step description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Step duration (e.g. 1-2 weeks)' })
  @IsOptional()
  @IsString()
  duration?: string | null;
}

class PartnerUniversityDto {
  @ApiProperty({ description: 'University name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string | null;
}

export class CreateScholarshipRequestDto {
  @ApiProperty({ description: 'Scholarship name' })
  @IsString()
  name: string;

  // Convenience aliases accepted by frontend (mapped in ScholarshipsService)
  @ApiPropertyOptional({ description: 'Provider (alias for organization_name)' })
  @IsOptional()
  @IsString()
  provider?: string | null;

  @ApiPropertyOptional({ description: 'Organization name' })
  @IsOptional()
  @IsString()
  organization_name?: string | null;

  @ApiPropertyOptional({ description: 'Scholarship amount', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount?: number | null;

  @ApiPropertyOptional({ 
    description: 'Scholarship type',
    enum: ['Merit-based', 'Need-based', 'Academic', 'Other'],
  })
  @IsOptional()
  @IsEnum(['Merit-based', 'Need-based', 'Academic', 'Other'])
  type?: 'Merit-based' | 'Need-based' | 'Academic' | 'Other' | null;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ description: 'Application deadline' })
  @IsOptional()
  @IsString()
  deadline?: string | null;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Level (study level)' })
  @IsOptional()
  @IsString()
  level?: string | null;

  @ApiPropertyOptional({ description: 'Field ID', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  field_id?: number | null;

  @ApiPropertyOptional({ description: 'Application URL (alias for website_url)' })
  @IsOptional()
  @IsString()
  application_url?: string | null;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website_url?: string | null;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contact_email?: string | null;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contact_phone?: string | null;

  @ApiPropertyOptional({ description: 'Processing time (weeks)', type: Number })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  processing_time_weeks?: number | null;

  @ApiPropertyOptional({ description: 'Applicant count', type: Number })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  applicant_count?: number | null;

  @ApiPropertyOptional({ description: 'Rating (0.0 - 5.0)', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  rating?: number | null;

  @ApiPropertyOptional({ description: 'Review count', type: Number })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  review_count?: number | null;

  @ApiPropertyOptional({ description: 'Requirements (text)' })
  @IsOptional()
  @IsString()
  requirements?: string | null;

  @ApiPropertyOptional({
    description: 'Eligibility requirements (JSON object; stored into requirements column)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  eligibility_requirements?: Record<string, any> | null;

  @ApiPropertyOptional({ description: 'Benefits (text)' })
  @IsOptional()
  @IsString()
  benefits?: string | null;

  @ApiPropertyOptional({
    description: 'Benefits JSON (object/array, stored to benefits_json column if present)',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  benefits_json?: Record<string, any> | any[] | null;

  @ApiPropertyOptional({
    description: 'Selection process steps (JSON array)',
    type: [SelectionProcessStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionProcessStepDto)
  selection_process?: SelectionProcessStepDto[] | null;

  @ApiPropertyOptional({
    description: 'Partner universities (JSON array)',
    type: [PartnerUniversityDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerUniversityDto)
  partner_universities?: PartnerUniversityDto[] | null;

  @ApiPropertyOptional({ description: 'Success rate', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  success_rate?: number | null;

  @ApiPropertyOptional({ 
    description: 'Scholarship status',
    enum: ['active', 'expired', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'expired', 'draft'])
  status?: 'active' | 'expired' | 'draft' | null;
}

