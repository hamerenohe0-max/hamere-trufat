import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeastsService } from '../services/feasts.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('feasts')
export class FeastsController {
  constructor(private readonly feastsService: FeastsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() createFeastDto: any, @CurrentUser() user: any) {
    return this.feastsService.create(createFeastDto, user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.feastsService.findAll({
      region: query.region,
      date: query.date ? new Date(query.date) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feastsService.findOne(id);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.feastsService.findByDate(new Date(date));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateFeastDto: any, @CurrentUser() user: any) {
    return this.feastsService.update(id, updateFeastDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feastsService.delete(id, user.id, user.role);
  }

  @Post(':id/reminder')
  @UseGuards(JwtAuthGuard)
  toggleReminder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feastsService.toggleReminder(id, user.id);
  }
}

