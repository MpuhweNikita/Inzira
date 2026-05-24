import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PromptsService } from './prompts.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI | null = null;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptsService: PromptsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');

    if (apiKey && apiKey !== 'sk-proj-mock-key-for-local-generation') {
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined, // Uses default OpenAI server if not defined, otherwise routes to Groq/Ollama
      });
      this.logger.log(`AI client initialized. Model: ${this.model}. Base URL: ${baseURL || 'Default OpenAI API'}`);
    } else {
      this.logger.warn('AI API Key is missing or set to placeholder. AI features will fallback to structured mock data.');
    }
  }

  async analyzeResume(resumeText: string): Promise<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    recommendations: string[];
  }> {
    const prompt = this.promptsService.getResumeAnalysisPrompt(resumeText);
    try {
      const response = await this.callOpenAi(prompt.system, prompt.user);
      return JSON.parse(response);
    } catch (e) {
      this.logger.error('Failed to run AI Resume analysis, using mock response:', e);
      return {
        score: 78,
        strengths: [
          'Solid base in TypeScript and backend engineering',
          'Good experience with Node.js and SQL database modeling',
          'Demonstrated knowledge of containerization using Docker',
        ],
        weaknesses: [
          'Lack of visible testing frameworks (Jest, Mocha)',
          'Resume lacks detailed descriptions of impact (metrics, percentages)',
          'Minimal mentions of cloud architecture or AWS services',
        ],
        missingSkills: ['Jest / Unit Testing', 'CI/CD Pipelines (GitHub Actions)', 'AWS (S3, EC2)', 'Redis Caching'],
        recommendations: [
          'Add a section highlighting testing strategies and frameworks.',
          'Quantify accomplishments (e.g., "improved performance by 30%").',
          'Deploy a personal project to AWS and list AWS services used.',
        ],
      };
    }
  }

  async detectSkillGap(resumeText: string, targetRole: string): Promise<{
    identifiedGaps: Array<{ skill: string; category: string; currentLevel: string; importance: string }>;
    recommendations: Array<{ skill: string; resourceType: string; title: string; providerOrDescription: string }>;
  }> {
    const prompt = this.promptsService.getSkillGapPrompt(resumeText, targetRole);
    try {
      const response = await this.callOpenAi(prompt.system, prompt.user);
      return JSON.parse(response);
    } catch (e) {
      this.logger.error(`Failed to detect AI skill gaps for ${targetRole}, using mock response:`, e);
      return {
        identifiedGaps: [
          { skill: 'AWS Cloud Services', category: 'technical', currentLevel: 'beginner', importance: 'high' },
          { skill: 'Jest testing framework', category: 'tool', currentLevel: 'none', importance: 'medium' },
          { skill: 'CI/CD Pipelines', category: 'technical', currentLevel: 'none', importance: 'high' },
          { skill: 'System Design', category: 'technical', currentLevel: 'intermediate', importance: 'high' },
        ],
        recommendations: [
          { skill: 'AWS Cloud Services', resourceType: 'course', title: 'AWS Certified Cloud Practitioner', providerOrDescription: 'Udemy' },
          { skill: 'Jest testing framework', resourceType: 'project', title: 'Add 80% test coverage to current NestJS backend', providerOrDescription: 'GitHub Portfolio Project' },
          { skill: 'CI/CD Pipelines', resourceType: 'certification', title: 'GitHub Actions Fundamentals', providerOrDescription: 'GitHub Learning' },
        ],
      };
    }
  }

  async generateRoadmap(targetRole: string, missingSkills: string[]): Promise<{
    targetRole: string;
    steps: Array<{ title: string; description: string; estimatedDuration: string; resources: string[]; completed: boolean }>;
  }> {
    const prompt = this.promptsService.getRoadmapPrompt(targetRole, missingSkills);
    try {
      const response = await this.callOpenAi(prompt.system, prompt.user);
      return JSON.parse(response);
    } catch (e) {
      this.logger.error(`Failed to generate AI roadmap for ${targetRole}, using mock response:`, e);
      return {
        targetRole,
        steps: [
          {
            title: 'Foundations of Cloud Infrastructure (AWS)',
            description: 'Learn core AWS services including IAM, EC2, S3, RDS, and Lambda. Understand cloud deployment mechanisms.',
            estimatedDuration: '3 weeks',
            resources: ['AWS Technical Essentials (Coursera)', 'AWS Certified Solutions Architect Course (ACantrill)'],
            completed: false,
          },
          {
            title: 'Enterprise Testing with NestJS & Jest',
            description: 'Learn unit, integration, and e2e testing methodologies in NestJS using Jest and Supertest.',
            estimatedDuration: '2 weeks',
            resources: ['NestJS Testing Course (official)', 'JavaScript Testing Bootcamp (Scrimba)'],
            completed: false,
          },
          {
            title: 'Automating Deployments with CI/CD',
            description: 'Write automated workflows with GitHub Actions to test, build, and deploy the application to Render/AWS.',
            estimatedDuration: '1 week',
            resources: ['GitHub Actions Tutorial (FreeCodeCamp)', 'CI/CD Complete Guide (DevOps School)'],
            completed: false,
          },
        ],
      };
    }
  }

  async generateInterviewQuestions(role: string, topic: string): Promise<{
    role: string;
    topic: string;
    questions: Array<{ id: string; questionText: string; context: string }>;
  }> {
    const prompt = this.promptsService.getInterviewPrompt(role, topic);
    try {
      const response = await this.callOpenAi(prompt.system, prompt.user);
      return JSON.parse(response);
    } catch (e) {
      this.logger.error(`Failed to generate AI interview questions for ${role}, using mock response:`, e);
      return {
        role,
        topic,
        questions: [
          { id: 'q1', questionText: 'Explain the dependency injection system in NestJS. How does it manage instances?', context: 'NestJS Dependency Injection' },
          { id: 'q2', questionText: 'How do you handle database transactions in Prisma when writing a multi-step operation?', context: 'Prisma Transaction Management' },
          { id: 'q3', questionText: 'Describe how JWT authentication works. How do you secure tokens and handle expiration?', context: 'Authentication & Security' },
          { id: 'q4', questionText: 'How would you scale a NestJS application to handle 10,000 requests per second?', context: 'System Scalability' },
          { id: 'q5', questionText: 'Describe a time when you had to debug a slow database query. What steps did you take?', context: 'Performance Optimization (Behavioral)' },
        ],
      };
    }
  }

  private async callOpenAi(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('AI client is not configured');
    }

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const choiceContent = completion.choices[0]?.message?.content;
    if (!choiceContent) {
      throw new Error('AI returned empty completion');
    }
    return choiceContent;
  }
}
