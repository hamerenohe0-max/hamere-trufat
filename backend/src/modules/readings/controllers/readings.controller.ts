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
import { ReadingsService } from '../services/readings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  create(@Body() createReadingDto: any) {
    return this.readingsService.create(createReadingDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.readingsService.findAll({
      language: query.language,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    });
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    const dateObj = new Date(date);
    return this.readingsService.findByDate(dateObj) || this.readingsService.findClosest(dateObj);
  }

  @Get('today')
  getToday() {
    const today = new Date();
    return this.readingsService.findByDate(today) || this.readingsService.findClosest(today);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.readingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'publisher')
  update(@Param('id') id: string, @Body() updateReadingDto: any) {
    return this.readingsService.update(id, updateReadingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.readingsService.delete(id);
  }
}

