import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users/services/users.service';
import { UsersController } from './users/controllers/users.controller';
import { User, UserSchema } from './users/schemas/user.schema';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}


