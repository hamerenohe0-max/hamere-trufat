import { Module } from '@nestjs/common';
import { ProgressService } from './services/progress.service';
import { ProgressController } from './controllers/progress.controller';
import { PdfService } from './services/pdf.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MediaModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService, PdfService],
  exports: [ProgressService, PdfService],
})
export class ProgressModule {}
