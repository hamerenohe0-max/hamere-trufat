import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DailyReadingsService } from './daily-readings.service';
import { CreateDailyReadingDto } from './dto/create-daily-reading.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('daily-readings')
export class DailyReadingsController {
    constructor(private readonly dailyReadingsService: DailyReadingsService) { }

    @Get('today')
    async getToday() {
        return this.dailyReadingsService.getToday();
    }

    @Get(':date')
    async getByDate(@Param('date') date: string) {
        return this.dailyReadingsService.findByDate(date);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'publisher') // Allow admins and publishers to manage readings
    async create(@Body() createDto: CreateDailyReadingDto) {
        return this.dailyReadingsService.create(createDto);
    }
}
