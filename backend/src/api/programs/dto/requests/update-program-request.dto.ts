import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramRequestDto } from './create-program-request.dto';

export class UpdateProgramRequestDto extends PartialType(CreateProgramRequestDto) {}

