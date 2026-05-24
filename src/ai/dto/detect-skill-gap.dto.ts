import { IsNotEmpty, IsString } from 'class-validator';

export class DetectSkillGapDto {
  @IsString()
  @IsNotEmpty({ message: 'targetRole is required' })
  targetRole: string;
}
