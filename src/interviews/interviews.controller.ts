import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StartInterviewDto } from './dto/start-interview.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { InterviewsService } from './interviews.service';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('start')
  async start(@CurrentUser() user: any, @Body() dto: StartInterviewDto) {
    const data = await this.interviewsService.startSession(dto, user);
    return {
      success: true,
      message: 'Interview session created successfully',
      data,
    };
  }

  @Get('my-sessions')
  async getMySessions(@CurrentUser() user: any) {
    const data = await this.interviewsService.getUserSessions(user);
    return {
      success: true,
      message: 'Interview sessions retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async getSession(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.interviewsService.getSession(id, user);
    return {
      success: true,
      message: 'Interview session details retrieved successfully',
      data,
    };
  }

  @Post(':id/submit')
  async submit(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: SubmitAnswersDto) {
    const data = await this.interviewsService.submitAnswers(id, dto, user);
    return {
      success: true,
      message: 'Interview responses evaluated and graded successfully',
      data,
    };
  }
}
