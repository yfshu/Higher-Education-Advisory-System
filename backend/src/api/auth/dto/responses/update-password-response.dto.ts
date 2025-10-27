import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordResponseDto {
  @ApiProperty({
    description: 'Status message.',
    example: 'Password updated successfully.',
  })
  message!: string;
}
