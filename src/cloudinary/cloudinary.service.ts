import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder = 'inzira_resumes',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('File is required for upload');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Signal EOF
      stream.pipe(uploadStream);
    });
  }
}
