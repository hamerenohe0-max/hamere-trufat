import { Module } from '@nestjs/common';
import { UsersService } from './users/services/users.service';
import { UsersController } from './users/controllers/users.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
