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
import { EventsService } from '../services/events.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() createEventDto: any, @CurrentUser() user: any) {
    return this.eventsService.create(createEventDto, user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.eventsService.findAll({
      featured: query.featured === 'true' ? true : undefined,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateEventDto: any, @CurrentUser() user: any) {
    return this.eventsService.update(id, updateEventDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.delete(id, user.id, user.role);
  }

  @Post(':id/reminder')
  @UseGuards(JwtAuthGuard)
  toggleReminder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.toggleReminder(id, user.id);
  }
}

