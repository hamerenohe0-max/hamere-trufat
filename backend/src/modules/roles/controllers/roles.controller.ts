import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('publisher/request')
  @UseGuards(JwtAuthGuard)
  createRequest(@CurrentUser() user: any) {
    return this.rolesService.createRequest(user.id);
  }

  @Get('publisher/requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() query: any) {
    return this.rolesService.findAll({
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('publisher/requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post('publisher/requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.approve(id, user.id);
  }

  @Post('publisher/requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    return this.rolesService.reject(id, user.id, body.reason);
  }
}

