import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Email address to receive the reset link.',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'Redirect URL after clicking the email reset link.',
    example: 'http://localhost:3000/',
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  redirectTo?: string;
}
