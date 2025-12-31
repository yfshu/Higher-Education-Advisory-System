import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './api/auth/auth.module';
import { ProfileModule } from './api/profile/profile.module';
import { ProgramsModule } from './api/programs/programs.module';
import { UniversitiesModule } from './api/universities/universities.module';
import { ScholarshipsModule } from './api/scholarships/scholarships.module';
import { SavedItemsModule } from './api/saved-items/saved-items.module';
import { HelpModule } from './api/help/help.module';
import { AdminModule } from './api/admin/admin.module';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    ProfileModule,
    ProgramsModule,
    UniversitiesModule,
    ScholarshipsModule,
    SavedItemsModule,
    HelpModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
