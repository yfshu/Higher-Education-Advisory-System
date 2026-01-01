import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUniversityRequestDto {
  @ApiProperty({ description: 'University name' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'University type',
    enum: ['public', 'private'],
  })
  @IsEnum(['public', 'private'])
  university_type: 'public' | 'private';

  @ApiPropertyOptional({ description: 'Based in (country/region)' })
  @IsOptional()
  @IsString()
  based_in?: string | null;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ description: 'University description' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website_url?: string | null;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone_number?: string | null;

  @ApiPropertyOptional({ description: 'Average fee (RM)', type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  average_fee?: number | null;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo_url?: string | null;

  @ApiPropertyOptional({ description: 'Image URLs (JSON array)' })
  @IsOptional()
  @IsArray()
  image_urls?: string[] | null;
}

