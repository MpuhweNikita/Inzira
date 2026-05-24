import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PromptsService } from './prompts.service';

@Module({
  controllers: [AiController],
  providers: [AiService, PromptsService],
  exports: [AiService],
})
export class AiModule {}
