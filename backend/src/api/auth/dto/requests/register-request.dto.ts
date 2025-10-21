import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export type IdentityType = 'ic' | 'passport';

const EDUCATION_LEVELS = [
  'SPM',
  'STPM',
  'A-Levels',
  'Foundation',
  'Diploma',
  'Bachelor',
  'Master',
  'Other',
] as const;

export class RegisterRequestDto {
  @ApiProperty({ description: 'Student first name.', example: 'Ahmad' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Student last name.', example: 'Rahman' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'Student email address.',
    example: 'ahmad.rahman@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'Contact number with country code.',
    example: '+60 12-345-6789',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Identity document type.',
    example: 'ic',
    enum: ['ic', 'passport'],
  })
  @IsEnum(['ic', 'passport'])
  identityType!: IdentityType;

  @ApiProperty({
    description:
      'Identity document number. Accepts IC or passport number based on the selected type.',
    example: '000515-12-1234',
  })
  @IsString()
  @IsNotEmpty()
  identityNumber!: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601).',
    example: '2000-05-15',
  })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ description: 'Nationality.', example: 'Malaysian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Current residence location.',
    example: 'Kuala Lumpur, Malaysia',
  })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL.',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Account password. Minimum 8 characters.',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'Confirm password. Must match password.',
    example: 'StrongPass123!',
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @ApiPropertyOptional({
    description: 'Highest education level attained.',
    enum: EDUCATION_LEVELS,
    example: 'SPM',
  })
  @IsOptional()
  @IsEnum(EDUCATION_LEVELS)
  educationLevel?: (typeof EDUCATION_LEVELS)[number];

  @ApiPropertyOptional({
    description: 'Name of the current institution.',
    example: 'SMK Kuala Lumpur',
  })
  @IsOptional()
  @IsString()
  currentInstitution?: string;

  @ApiPropertyOptional({
    description: 'Selected field of interest identifier.',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  fieldOfInterestId?: number;

  @ApiPropertyOptional({
    description: 'Academic results summary.',
    example: 'CGPA 3.75, 8A+ in SPM',
  })
  @IsOptional()
  @IsString()
  academicResult?: string;

  @ApiPropertyOptional({
    description:
      'Preferred study preferences such as location, study mode, or university type.',
    example:
      'Prefer Klang Valley universities with strong internship programmes.',
  })
  @IsOptional()
  @IsString()
  studyPreferences?: string;

  @ApiPropertyOptional({
    description: 'Student career goal.',
    example: 'Software developer in a Malaysian tech company',
  })
  @IsOptional()
  @IsString()
  careerGoal?: string;
}
