import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({ example: 'Avatar uploaded successfully.' })
  message!: string;

  @ApiProperty({ example: 'https://...' })
  avatarUrl!: string;
}

