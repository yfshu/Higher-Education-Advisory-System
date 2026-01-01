import { Module } from '@nestjs/common';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService, AuthGuard],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}

