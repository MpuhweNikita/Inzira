import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GenerateRoadmapDto {
  @IsString()
  @IsNotEmpty({ message: 'targetRole is required' })
  targetRole: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'missingSkills array is required' })
  missingSkills: string[];
}
