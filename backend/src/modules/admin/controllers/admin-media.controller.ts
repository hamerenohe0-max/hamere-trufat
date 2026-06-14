import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { MediaService } from '../../media/services/media.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'publisher')
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('media')
  getMedia(@Query() query: any) {
    return this.mediaService.findAll(
      query.userId,
      query.limit ? parseInt(query.limit) : 50,
      query.offset ? parseInt(query.offset) : 0,
    );
  }

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(@UploadedFile() file: any, @CurrentUser() user: any) {
    return this.mediaService.uploadFile(file, user.id);
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.deleteFile(id, user.id, user.role);
  }
}
