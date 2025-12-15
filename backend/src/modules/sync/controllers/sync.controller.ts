import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SyncService } from '../services/sync.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('cache')
  @UseGuards(JwtAuthGuard)
  saveCache(
    @Body() body: {
      deviceId: string;
      entity: string;
      key: string;
      payload: Record<string, unknown>;
      expiresAt?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.syncService.saveCache(
      user.id,
      body.deviceId,
      body.entity,
      body.key,
      body.payload,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  @Get('cache')
  @UseGuards(JwtAuthGuard)
  getCache(
    @Query('deviceId') deviceId: string,
    @Query('entity') entity: string,
    @Query('key') key: string,
    @CurrentUser() user: any,
  ) {
    return this.syncService.getCache(user.id, deviceId, entity, key);
  }

  @Get('cache/all')
  @UseGuards(JwtAuthGuard)
  getAllCache(
    @CurrentUser() user: any,
    @Query('deviceId') deviceId: string,
    @Query('entity') entity?: string,
  ) {
    return this.syncService.getAllCache(user.id, deviceId, entity);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  syncData(
    @Body() body: {
      deviceId: string;
      data: Array<{
        entity: string;
        key: string;
        payload: Record<string, unknown>;
        version: number;
      }>;
    },
    @CurrentUser() user: any,
  ) {
    return this.syncService.syncData(user.id, body.deviceId, body.data);
  }

  @Delete('cache')
  @UseGuards(JwtAuthGuard)
  deleteCache(
    @Query('deviceId') deviceId: string,
    @Query('entity') entity: string,
    @Query('key') key: string,
    @CurrentUser() user: any,
  ) {
    return this.syncService.deleteCache(user.id, deviceId, entity, key);
  }
}

