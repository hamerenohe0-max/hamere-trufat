import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  getNotifications(@Query() query: any) {
    return this.notificationsService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Post('notifications')
  createNotification(@Body() createNotificationDto: any) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Delete('notifications/:id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
