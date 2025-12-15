import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { MediaService } from '../../media/services/media.service';

@Injectable()
export class PdfService {
  constructor(private mediaService: MediaService) {}

  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await (pdfParse as any)(pdfBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async getPdfMetadata(pdfBuffer: Buffer): Promise<{
    pages: number;
    info: Record<string, unknown>;
  }> {
    try {
      const data = await (pdfParse as any)(pdfBuffer);
      return {
        pages: data.numpages,
        info: data.info || {},
      };
    } catch (error) {
      throw new Error(`Failed to get PDF metadata: ${error.message}`);
    }
  }
}

