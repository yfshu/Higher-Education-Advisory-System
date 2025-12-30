import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export type SubjectGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'G' | '0';

export class RegisterCompleteRequestDto {
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'Ahmad Rahman',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'User email address. Must be unique and valid format.',
    example: 'ahmad.rahman@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Contact number in E.164 format (e.g., +60123456789). Must start with + followed by 8-15 digits.',
    example: '+60123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{8,15}$/, {
    message: 'Phone number must be in E.164 format: + followed by 8-15 digits (no spaces or dashes)',
  })
  phoneNumber!: string;

  @ApiPropertyOptional({
    description: 'Current location string (e.g., city, lat/long). Optional.',
    example: 'Kuala Lumpur, MY',
  })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiProperty({
    description:
      'Account password. Minimum 8 characters, must contain uppercase, number, and special character. Cannot contain email.',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @ApiProperty({
    description: 'Confirm password. Must match password.',
    example: 'StrongPass123!',
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @ApiProperty({
    description: 'Study level. Must be SPM or STPM.',
    enum: ['SPM', 'STPM'],
    example: 'SPM',
  })
  @IsEnum(['SPM', 'STPM'])
  @IsNotEmpty()
  studyLevel!: 'SPM' | 'STPM';

  @ApiProperty({
    description: 'Extracurricular participation.',
    example: true,
  })
  @IsBoolean()
  extracurricular!: boolean;

  @ApiProperty({
    description:
      'Bahasa Malaysia grade. Must be A, B, C, D, E, G, or 0 (not taken).',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  bm!: SubjectGrade;

  @ApiProperty({
    description: 'English grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  english!: SubjectGrade;

  @ApiProperty({
    description: 'History grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'B',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  history!: SubjectGrade;

  @ApiProperty({
    description: 'Mathematics grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  mathematics!: SubjectGrade;

  @ApiProperty({
    description: 'Islamic Education / Moral Education grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  islamicEducationMoralEducation!: SubjectGrade;

  @ApiProperty({
    description: 'Physics grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  physics!: SubjectGrade;

  @ApiProperty({
    description: 'Chemistry grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  chemistry!: SubjectGrade;

  @ApiProperty({
    description: 'Biology grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'B',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  biology!: SubjectGrade;

  @ApiProperty({
    description: 'Additional Mathematics grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: 'A',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  additionalMathematics!: SubjectGrade;

  @ApiProperty({
    description: 'Geography grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  geography!: SubjectGrade;

  @ApiProperty({
    description: 'Economics grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  economics!: SubjectGrade;

  @ApiProperty({
    description: 'Accounting grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  accounting!: SubjectGrade;

  @ApiProperty({
    description: 'Chinese grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  chinese!: SubjectGrade;

  @ApiProperty({
    description: 'Tamil grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  tamil!: SubjectGrade;

  @ApiProperty({
    description: 'ICT grade.',
    enum: ['A', 'B', 'C', 'D', 'E', 'G', '0'],
    example: '0',
  })
  @IsEnum(['A', 'B', 'C', 'D', 'E', 'G', '0'])
  ict!: SubjectGrade;

  @ApiProperty({
    description:
      'Interest in mathematics (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  mathsInterest!: number;

  @ApiProperty({
    description:
      'Interest in science (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  scienceInterest!: number;

  @ApiProperty({
    description:
      'Interest in computers/IT (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  computerInterest!: number;

  @ApiProperty({
    description: 'Interest in writing (1-5). Must be integer between 1 and 5.',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  writingInterest!: number;

  @ApiProperty({
    description: 'Interest in arts (1-5). Must be integer between 1 and 5.',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  artInterest!: number;

  @ApiProperty({
    description:
      'Interest in business (1-5). Must be integer between 1 and 5.',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  businessInterest!: number;

  @ApiProperty({
    description:
      'Interest in social sciences (1-5). Must be integer between 1 and 5.',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  socialInterest!: number;

  @ApiProperty({
    description:
      'Logical thinking skill (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  logicalThinking!: number;

  @ApiProperty({
    description:
      'Problem-solving skill (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  problemSolving!: number;

  @ApiProperty({
    description: 'Creativity skill (1-5). Must be integer between 1 and 5.',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  creativity!: number;

  @ApiProperty({
    description:
      'Communication skill (1-5). Must be integer between 1 and 5.',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  communication!: number;

  @ApiProperty({
    description: 'Teamwork skill (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  teamwork!: number;

  @ApiProperty({
    description: 'Leadership skill (1-5). Must be integer between 1 and 5.',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  leadership!: number;

  @ApiProperty({
    description:
      'Attention to detail skill (1-5). Must be integer between 1 and 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @IsNotEmpty()
  attentionToDetail!: number;

  @ApiProperty({
    description: 'Budget range preference.',
    example: 'RM 50,000 - RM 100,000',
  })
  @IsString()
  @IsNotEmpty()
  budgetRange!: string;

  @ApiProperty({
    description: 'Preferred study location.',
    example: 'Kuala Lumpur',
  })
  @IsString()
  @IsNotEmpty()
  preferredLocation!: string;

  @ApiPropertyOptional({
    description: 'Preferred country (optional).',
    example: 'Malaysia',
  })
  @IsString()
  @IsOptional()
  preferredCountry?: string;

  @ApiPropertyOptional({
    description: 'Study mode preference (optional).',
    example: 'Full-time',
  })
  @IsString()
  @IsOptional()
  studyMode?: string;
}

