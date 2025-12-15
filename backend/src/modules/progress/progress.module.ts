import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './services/progress.service';
import { ProgressController } from './controllers/progress.controller';
import { ProgressReport, ProgressReportSchema } from './schemas/progress-report.schema';
import { PdfService } from './services/pdf.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProgressReport.name, schema: ProgressReportSchema }]),
    MediaModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService, PdfService],
  exports: [ProgressService, PdfService],
})
export class ProgressModule {}
