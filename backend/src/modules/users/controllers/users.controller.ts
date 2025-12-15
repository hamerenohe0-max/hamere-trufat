import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import type { SafeUser } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Roles('user', 'publisher', 'admin')
  async me(@CurrentUser() user: SafeUser) {
    return user;
  }

  @Patch('me')
  @Roles('user', 'publisher', 'admin')
  async updateProfile(@CurrentUser() user: SafeUser, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, body);
  }
}


