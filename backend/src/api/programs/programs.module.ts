import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [ProgramsController],
  providers: [ProgramsService, AuthGuard],
  exports: [ProgramsService],
})
export class ProgramsModule {}

