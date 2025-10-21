import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Identifier of the newly created user.',
    example: 'a9f0c2d9-3c8b-4f0d-9ef2-1234567890ab',
  })
  userId!: string;

  @ApiProperty({
    description: 'Registered email address.',
    example: 'ahmad.rahman@email.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Status message returned after registration.',
    example: 'Account created successfully. Please verify your email.',
  })
  message!: string;
}
