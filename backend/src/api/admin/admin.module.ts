import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthGuard } from '../../guards/auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [AdminController],
  providers: [AdminService, AuthGuard],
  exports: [AdminService],
})
export class AdminModule {}

