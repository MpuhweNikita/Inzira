import { IsNotEmpty, IsString } from 'class-validator';

export class StartInterviewDto {
  @IsString()
  @IsNotEmpty({ message: 'role is required' })
  role: string;

  @IsString()
  @IsNotEmpty({ message: 'topic is required' })
  topic: string;
}
