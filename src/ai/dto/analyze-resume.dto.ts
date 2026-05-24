import { IsNotEmpty, IsUUID } from 'class-validator';

export class AnalyzeResumeDto {
  @IsUUID(4, { message: 'Invalid resume ID format' })
  @IsNotEmpty({ message: 'resumeId is required' })
  resumeId: string;
}
