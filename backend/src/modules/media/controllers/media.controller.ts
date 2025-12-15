import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../services/media.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any, @CurrentUser() user: any) {
    return this.mediaService.uploadFile(file, user.id);
  }

  @Get()
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.mediaService.findAll(
      query.userId || user.id,
      query.limit ? parseInt(query.limit) : 50,
      query.offset ? parseInt(query.offset) : 0,
    );
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.deleteFile(id, user.id);
  }
}

