import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SupabaseModule } from '../../database/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
