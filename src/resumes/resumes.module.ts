import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { TextExtractorService } from './text-extractor.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CloudinaryModule, AiModule],
  controllers: [ResumesController],
  providers: [ResumesService, TextExtractorService],
  exports: [ResumesService],
})
export class ResumesModule {}
