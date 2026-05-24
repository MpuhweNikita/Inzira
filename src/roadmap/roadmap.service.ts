import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, CareerRoadmap } from '@prisma/client';

@Injectable()
export class RoadmapService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRoadmaps(user: User): Promise<CareerRoadmap[]> {
    return this.prisma.careerRoadmap.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoadmap(id: string, user: User): Promise<CareerRoadmap> {
    const roadmap = await this.prisma.careerRoadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      throw new NotFoundException('Roadmap not found');
    }

    if (roadmap.userId !== user.id) {
      throw new NotFoundException('Roadmap not found or access denied');
    }

    return roadmap;
  }

  async toggleStep(id: string, stepIndex: number, user: User): Promise<CareerRoadmap> {
    const roadmap = await this.getRoadmap(id, user);

    const steps = roadmap.steps as Array<{
      title: string;
      description: string;
      estimatedDuration: string;
      resources: string[];
      completed: boolean;
    }>;

    if (stepIndex < 0 || stepIndex >= steps.length) {
      throw new NotFoundException(`Step at index ${stepIndex} does not exist`);
    }

    // Toggle completion status
    steps[stepIndex].completed = !steps[stepIndex].completed;

    // Recalculate progress percentage
    const completedCount = steps.filter((step) => step.completed).length;
    const currentProgress = parseFloat(((completedCount / steps.length) * 100).toFixed(1));

    return this.prisma.careerRoadmap.update({
      where: { id },
      data: {
        steps: steps as any,
        currentProgress,
      },
    });
  }
}
