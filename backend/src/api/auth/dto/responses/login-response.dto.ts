import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Unique identifier of the authenticated user.',
    example: 'a9f0c2d9-3c8b-4f0d-9ef2-1234567890ab',
  })
  id!: string;

  @ApiProperty({
    description: 'Email address of the authenticated user.',
    example: 'student@demo.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Role of the authenticated user.',
    example: 'student',
  })
  role!: string;

  @ApiPropertyOptional({
    description: 'Full name of the user.',
    example: 'Ahmad Rahman',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user.',
    example: '+60 12-345-6789',
  })
  phoneNumber?: string;
}

export class StudentProfileDto {
  @ApiPropertyOptional({ 
    description: 'Phone number in E.164 format',
    example: '+60123456789' 
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Country code extracted from phone number',
    example: '+60' 
  })
  countryCode?: string;

  @ApiPropertyOptional({ 
    description: 'Avatar URL from Supabase Storage',
    example: 'https://...' 
  })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'SPM' })
  studyLevel?: string;

  @ApiPropertyOptional({ example: true })
  extracurricular?: boolean;

  @ApiPropertyOptional({ example: 'A' })
  bm?: string;

  @ApiPropertyOptional({ example: 'A' })
  english?: string;

  @ApiPropertyOptional({ example: 'B' })
  history?: string;

  @ApiPropertyOptional({ example: 'A' })
  mathematics?: string;

  @ApiPropertyOptional({ example: 'A' })
  islamicEducationMoralEducation?: string;

  @ApiPropertyOptional({ example: 'A' })
  physics?: string;

  @ApiPropertyOptional({ example: 'A' })
  chemistry?: string;

  @ApiPropertyOptional({ example: 'B' })
  biology?: string;

  @ApiPropertyOptional({ example: 'A' })
  additionalMathematics?: string;

  @ApiPropertyOptional({ example: '0' })
  geography?: string;

  @ApiPropertyOptional({ example: '0' })
  economics?: string;

  @ApiPropertyOptional({ example: '0' })
  accounting?: string;

  @ApiPropertyOptional({ example: '0' })
  chinese?: string;

  @ApiPropertyOptional({ example: '0' })
  tamil?: string;

  @ApiPropertyOptional({ example: '0' })
  ict?: string;

  @ApiPropertyOptional({ example: 5 })
  mathsInterest?: number;

  @ApiPropertyOptional({ example: 5 })
  scienceInterest?: number;

  @ApiPropertyOptional({ example: 5 })
  computerInterest?: number;

  @ApiPropertyOptional({ example: 3 })
  writingInterest?: number;

  @ApiPropertyOptional({ example: 2 })
  artInterest?: number;

  @ApiPropertyOptional({ example: 3 })
  businessInterest?: number;

  @ApiPropertyOptional({ example: 2 })
  socialInterest?: number;

  @ApiPropertyOptional({ example: 5 })
  logicalThinking?: number;

  @ApiPropertyOptional({ example: 5 })
  problemSolving?: number;

  @ApiPropertyOptional({ example: 4 })
  creativity?: number;

  @ApiPropertyOptional({ example: 4 })
  communication?: number;

  @ApiPropertyOptional({ example: 5 })
  teamwork?: number;

  @ApiPropertyOptional({ example: 3 })
  leadership?: number;

  @ApiPropertyOptional({ example: 5 })
  attentionToDetail?: number;
}

export class PreferencesDto {
  @ApiPropertyOptional({ example: 'RM 50,000 - RM 100,000' })
  budgetRange?: string;

  @ApiPropertyOptional({ example: 'Kuala Lumpur' })
  preferredLocation?: string;

  @ApiPropertyOptional({ example: 'Malaysia' })
  preferredCountry?: string;

  @ApiPropertyOptional({ example: 'Full-time' })
  studyMode?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Friendly message describing the login result.',
    example: 'Login successful.',
  })
  message!: string;

  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;

  @ApiPropertyOptional({ type: StudentProfileDto })
  profile?: StudentProfileDto;

  @ApiPropertyOptional({ type: PreferencesDto })
  preferences?: PreferencesDto;

  @ApiProperty({
    description: 'Supabase access token for client session.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Supabase refresh token for client session.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Token expiry in seconds.',
    example: 3600,
  })
  expiresIn!: number;
}
