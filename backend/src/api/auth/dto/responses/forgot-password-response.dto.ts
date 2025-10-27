import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Status message.',
    example: 'Password reset email sent.',
  })
  message!: string;
}
