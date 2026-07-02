import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure the uploads directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async processAndSaveMedia(file: Express.Multer.File): Promise<string> {
    this.logger.log(`Processing media: ${file.originalname}`);

    try {
      const isVideo = file.mimetype.startsWith('video/');
      const ext = isVideo ? path.extname(file.originalname) || '.mp4' : '.webp';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(this.uploadPath, filename);

      if (isVideo) {
        fs.writeFileSync(filePath, file.buffer);
      } else {
        // Process image with sharp
        await sharp(file.buffer)
          .resize({ width: 1920, withoutEnlargement: true }) // Resize if larger than 1920px width
          .webp({ quality: 80 }) // Convert to webp with 80% quality for optimal compression
          .toFile(filePath);
      }

      this.logger.log(`Media successfully processed and saved to ${filePath}`);

      // Return the URL path
      return `/uploads/${filename}`;
    } catch (error) {
      this.logger.error('Failed to process media', error);
      throw new InternalServerErrorException('Failed to process and save media');
    }
  }
}
