import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email address associated with the BackToSchool account.',
    example: 'student@demo.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Account password. Minimum 8 characters.',
    example: 'demo1234',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
