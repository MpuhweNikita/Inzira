import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TextExtractorService } from './text-extractor.service';
import { AiService } from '../ai/ai.service';
import { Resume, User } from '@prisma/client';

@Injectable()
export class ResumesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly textExtractorService: TextExtractorService,
    private readonly aiService: AiService,
  ) {}

  async uploadAndAnalyze(file: Express.Multer.File, user: User): Promise<any> {
    // 1. Upload to Cloudinary
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file, 'inzira_resumes');

    // 2. Extract text from file
    const extractedText = await this.textExtractorService.extractText(file.buffer, file.mimetype);

    // 3. Save metadata to PostgreSQL
    const resume = await this.prisma.resume.create({
      data: {
        userId: user.id,
        fileUrl: cloudinaryResponse.secure_url,
        fileKey: cloudinaryResponse.public_id,
        fileName: file.originalname,
        extractedText,
      },
    });

    // 4. Send extracted text to AI service for auto-analysis
    const analysis = await this.aiService.analyzeResume(extractedText);

    // 5. Save analysis results
    const analysisRecord = await this.prisma.analysisResult.create({
      data: {
        resumeId: resume.id,
        score: analysis.score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        recommendations: analysis.recommendations,
        rawJson: analysis as any,
      },
    });

    return {
      ...resume,
      analysisResults: [analysisRecord],
      analysis: analysisRecord,
    };
  }

  async getResume(id: string, user: User) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.userId !== user.id) {
      throw new NotFoundException('Resume not found or access denied');
    }

    return resume;
  }
}
