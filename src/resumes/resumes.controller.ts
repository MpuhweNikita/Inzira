import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ResumesService } from './resumes.service';
import { User } from '@prisma/client';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(pdf|vnd.openxmlformats-officedocument.wordprocessingml.document|msword|docx)/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB limit
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.resumesService.uploadAndAnalyze(file, user);
    return {
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data,
    };
  }

  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    const data = await this.resumesService.getResume(id, user);
    return {
      success: true,
      message: 'Resume retrieved successfully',
      data,
    };
  }
}
