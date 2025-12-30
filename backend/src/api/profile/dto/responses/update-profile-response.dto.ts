import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileResponseDto {
  @ApiProperty({ example: 'Profile updated successfully.' })
  message!: string;
}

