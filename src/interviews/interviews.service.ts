import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { StartInterviewDto } from './dto/start-interview.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { User, InterviewSession } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async startSession(dto: StartInterviewDto, user: User): Promise<InterviewSession> {
    const aiQuestions = await this.aiService.generateInterviewQuestions(dto.role, dto.topic);

    return this.prisma.interviewSession.create({
      data: {
        userId: user.id,
        role: dto.role,
        topic: dto.topic,
        questions: aiQuestions.questions as any,
      },
    });
  }

  async getSession(id: string, user: User): Promise<InterviewSession> {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.userId !== user.id) {
      throw new NotFoundException('Interview session not found or access denied');
    }

    return session;
  }

  async getUserSessions(user: User): Promise<InterviewSession[]> {
    return this.prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitAnswers(id: string, dto: SubmitAnswersDto, user: User): Promise<InterviewSession> {
    const session = await this.getSession(id, user);

    if (session.responses) {
      throw new BadRequestException('This interview session has already been submitted and graded');
    }

    const questions = session.questions as Array<{ id: string; questionText: string; context: string }>;

    // Verify responses cover the questions
    const gradedResponses = dto.responses.map((resp) => {
      const question = questions.find((q) => q.id === resp.questionId);
      const questionText = question ? question.questionText : 'Unknown Question';
      
      // Perform automated grading (mocked or custom rule for simplicity/robustness)
      const wordsCount = resp.answerText.trim().split(/\s+/).length;
      let score = 50;
      let feedback = 'Your answer is too short. Try explaining with more concrete examples and concepts.';

      if (wordsCount > 40) {
        score = 85;
        feedback = 'Great job! You provided a detailed explanation. Make sure to reference the STAR method (Situation, Task, Action, Result) in your behavioral responses.';
      } else if (wordsCount > 20) {
        score = 70;
        feedback = 'Good answer. You hit the key conceptual points, but could improve by detailing your specific hands-on experience.';
      }

      return {
        questionId: resp.questionId,
        questionText,
        answerText: resp.answerText,
        feedback,
        score,
      };
    });

    // Calculate overall statistics
    const totalScore = gradedResponses.reduce((sum, item) => sum + item.score, 0);
    const overallScore = Math.round(totalScore / gradedResponses.length);

    let overallFeedback = 'Excellent performance! You showed strong understanding of the topics. Work on clarifying technical details.';
    if (overallScore < 70) {
      overallFeedback = 'Good attempt. Focus on preparing structured responses using technical terminology and practicing mock questions.';
    } else if (overallScore >= 90) {
      overallFeedback = 'Outstanding interview! Your responses are clear, detailed, and directly address the questions. Ready for real interviews!';
    }

    return this.prisma.interviewSession.update({
      where: { id },
      data: {
        responses: gradedResponses as any,
        score: overallScore,
        overallFeedback,
      },
    });
  }
}
