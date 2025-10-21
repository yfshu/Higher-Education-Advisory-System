import { ApiProperty } from '@nestjs/swagger';

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
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Friendly message describing the login result.',
    example: 'Login successful.',
  })
  message!: string;

  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;
}
