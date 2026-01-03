import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ProgramsModule } from '../programs/programs.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [SupabaseModule, ProgramsModule],
  controllers: [AIController],
  providers: [AIService, AuthGuard],
  exports: [AIService],
})
export class AIModule {}

