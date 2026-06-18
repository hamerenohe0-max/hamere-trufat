import { Controller, Get, Patch, Post, UseGuards, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../services/users.service';
import type { SafeUser } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public endpoint - no auth required
  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // Protected endpoints
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'publisher', 'admin')
  async me(@CurrentUser() user: SafeUser) {
    return user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'publisher', 'admin')
  async updateProfile(@CurrentUser() user: SafeUser, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'publisher', 'admin')
  async changePassword(@CurrentUser() user: SafeUser, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, body);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'publisher', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: any, @CurrentUser() user: SafeUser) {
    const avatarUrl = await this.usersService.uploadAvatar(user.id, file);
    return { avatarUrl };
  }
}
