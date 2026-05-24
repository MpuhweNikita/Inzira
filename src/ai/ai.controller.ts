import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { DetectSkillGapDto } from './dto/detect-skill-gap.dto';
import { GenerateRoadmapDto } from './dto/generate-roadmap.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeResume(@CurrentUser() user: any, @Body() dto: AnalyzeResumeDto) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this resume');
    }

    if (!resume.extractedText) {
      throw new NotFoundException('Resume text has not been extracted. Upload again.');
    }

    const analysis = await this.aiService.analyzeResume(resume.extractedText);

    // Save to DB
    const savedResult = await this.prisma.analysisResult.create({
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
      success: true,
      message: 'Resume analyzed successfully',
      data: savedResult,
    };
  }

  @Post('skill-gap')
  @HttpCode(HttpStatus.OK)
  async detectSkillGap(@CurrentUser() user: any, @Body() dto: DetectSkillGapDto) {
    // Get the latest resume
    const resume = await this.prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume || !resume.extractedText) {
      throw new NotFoundException('No uploaded resume found for this user. Please upload a resume first.');
    }

    const gapResult = await this.aiService.detectSkillGap(resume.extractedText, dto.targetRole);

    // Save to DB
    const savedResult = await this.prisma.skillGap.create({
      data: {
        userId: user.id,
        identifiedGaps: gapResult.identifiedGaps as any,
        recommendations: gapResult.recommendations as any,
      },
    });

    return {
      success: true,
      message: 'Skill gaps detected successfully',
      data: savedResult,
    };
  }

  @Post('roadmap')
  @HttpCode(HttpStatus.OK)
  async generateRoadmap(@CurrentUser() user: any, @Body() dto: GenerateRoadmapDto) {
    const roadmapResult = await this.aiService.generateRoadmap(dto.targetRole, dto.missingSkills);

    // Save to DB
    const savedResult = await this.prisma.careerRoadmap.create({
      data: {
        userId: user.id,
        targetRole: dto.targetRole,
        steps: roadmapResult.steps as any,
      },
    });

    return {
      success: true,
      message: 'Personalized career roadmap generated successfully',
      data: savedResult,
    };
  }
}
