import { IsObject, IsNotEmpty } from 'class-validator';

export class CompareRequestDto {
  @IsObject()
  @IsNotEmpty()
  programA: any;

  @IsObject()
  @IsNotEmpty()
  programB: any;
}

