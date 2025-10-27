import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordRequestDto {
  @ApiProperty({
    description: 'New password to set.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
