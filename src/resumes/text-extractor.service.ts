import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
const pdfParse = require('pdf-parse');

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
      return this.extractFromPdf(buffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      mimeType.includes('docx') || 
      mimeType.includes('officedocument')
    ) {
      return this.extractFromDocx(buffer);
    } else {
      throw new BadRequestException(`Unsupported file format for text extraction: ${mimeType}`);
    }
  }

  private async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Extracted text is empty');
      }
      return data.text;
    } catch (e) {
      this.logger.error('Failed to parse PDF document:', e);
      throw new BadRequestException('Failed to extract text from the PDF document. Ensure the file is not scanned/image-only or corrupted.');
    }
  }

  private async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('Extracted text is empty');
      }
      return result.value;
    } catch (e) {
      this.logger.error('Failed to parse DOCX document:', e);
      throw new BadRequestException('Failed to extract text from the DOCX document. Ensure the file is not corrupted.');
    }
  }
}
