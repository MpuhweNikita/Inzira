import { Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoadmapService } from './roadmap.service';

@Controller('roadmap')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get('my-roadmaps')
  async getMyRoadmaps(@CurrentUser() user: any) {
    const data = await this.roadmapService.getUserRoadmaps(user);
    return {
      success: true,
      message: 'Roadmaps retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async getRoadmap(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.roadmapService.getRoadmap(id, user);
    return {
      success: true,
      message: 'Roadmap details retrieved successfully',
      data,
    };
  }

  @Patch(':id/step/:stepIndex')
  async toggleStep(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('stepIndex', ParseIntPipe) stepIndex: number,
  ) {
    const data = await this.roadmapService.toggleStep(id, stepIndex, user);
    return {
      success: true,
      message: `Step at index ${stepIndex} updated successfully`,
      data,
    };
  }
}
