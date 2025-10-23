import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Status message returned after logout.',
    example: 'Logout successful.',
  })
  message!: string;
}
