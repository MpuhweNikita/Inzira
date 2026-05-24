import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class ResponseItemDto {
  @IsString()
  @IsNotEmpty({ message: 'questionId is required' })
  questionId: string;

  @IsString()
  @IsNotEmpty({ message: 'answerText is required' })
  answerText: string;
}

export class SubmitAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseItemDto)
  responses: ResponseItemDto[];
}
