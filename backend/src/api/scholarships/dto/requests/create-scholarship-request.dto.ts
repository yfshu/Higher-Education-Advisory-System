import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScholarshipRequestDto {
  @ApiProperty({ description: 'Scholarship name' })
  @IsString()
  name: string;

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

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website_url?: string | null;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contact_email?: string | null;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contact_phone?: string | null;

  @ApiPropertyOptional({ description: 'Requirements (text)' })
  @IsOptional()
  @IsString()
  requirements?: string | null;

  @ApiPropertyOptional({ description: 'Benefits (text)' })
  @IsOptional()
  @IsString()
  benefits?: string | null;

  @ApiPropertyOptional({ description: 'Success rate', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  success_rate?: number | null;

  @ApiPropertyOptional({ 
    description: 'Scholarship status',
    enum: ['active', 'expired', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'expired', 'draft'])
  status?: 'active' | 'expired' | 'draft' | null;
}

