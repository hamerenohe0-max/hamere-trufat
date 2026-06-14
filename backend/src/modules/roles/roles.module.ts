import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { UsersModule } from '../users/users.module';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    UsersModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
