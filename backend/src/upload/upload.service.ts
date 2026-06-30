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

  async processAndSaveImage(file: Express.Multer.File): Promise<string> {
    this.logger.log(`Processing image: ${file.originalname}`);

    try {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const filePath = path.join(this.uploadPath, filename);

      // Process image with sharp
      await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true }) // Resize if larger than 1920px width
        .webp({ quality: 80 }) // Convert to webp with 80% quality for optimal compression
        .toFile(filePath);

      this.logger.log(`Image successfully processed and saved to ${filePath}`);

      // Return the URL path
      return `/uploads/${filename}`;
    } catch (error) {
      this.logger.error('Failed to process image', error);
      throw new InternalServerErrorException('Failed to process and save image');
    }
  }
}
