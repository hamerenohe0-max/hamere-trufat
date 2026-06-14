import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UsersService } from '../../users/services/users.service';
import { RolesService } from '../../roles/services/roles.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @Get('users')
  @Roles('admin')
  getUsers(@Query() query: any) {
    return this.usersService.findAll({
      role: query.role,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('publishers/requests')
  @Roles('admin')
  getPublisherRequests(@Query() query: any) {
    return this.rolesService.findAll({
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('publishers')
  @Roles('admin')
  getPublishers(@Query() query: any) {
    return this.usersService.findAll({
      role: 'publisher',
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('users/:id')
  @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.usersService.getFullProfile(id);
  }

  @Patch('users/:id')
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    console.log(`Admin update user ${id} payload:`, JSON.stringify(updateUserDto));
    if (updateUserDto.status) {
      await this.usersService.updateStatus(id, updateUserDto.status);
    }
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Post('users/:id/suspend')
  @Roles('admin')
  suspendUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'suspended');
  }

  @Post('users/:id/activate')
  @Roles('admin')
  activateUser(@Param('id') id: string) {
    return this.usersService.updateStatus(id, 'active');
  }

  @Delete('users/:id')
  @Roles('admin')
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post('publishers/:id/approve')
  @Roles('admin')
  approvePublisher(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.approve(id, user.id);
  }

  @Post('publishers/:id/reject')
  @Roles('admin')
  rejectPublisher(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    return this.rolesService.reject(id, user.id, body.reason);
  }
}
