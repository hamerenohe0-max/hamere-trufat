import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminDashboardController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/charts')
  getCharts(@Query('days') days?: string) {
    return this.adminService.getChartData(days ? parseInt(days) : 30);
  }

  @Get('dashboard/content')
  getContentStats() {
    return this.adminService.getContentStats();
  }

  @Get('analytics')
  getAnalytics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminService.getAnalytics({ startDate, endDate });
  }
}
