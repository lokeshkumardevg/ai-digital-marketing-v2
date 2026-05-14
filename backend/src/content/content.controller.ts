import { Controller, Post, Body, Get, Param, Patch, Delete, UploadedFiles,UseInterceptors } from '@nestjs/common';
import { ContentService } from './content.service';
import { FetchUrlImagesDto } from './dto/fetch-url-images.dto';
import { GenerateReferenceCreativeDto } from './dto/generate-reference-creative.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getAllContent() {
    return this.contentService.getAllContent();
  }

  @Post()
  async createManualCreative(
    @Body()
    body: {
      title: string;
      contentType: string;
      imageUrl: string;
      thumbnailUrl?: string;
      lifetimeStart?: string;
      lifetimeEnd?: string;
      platforms?: string[];
    },
  ) {
    return this.contentService.createManualCreative(body);
  }

  @Delete(':id')
  async deleteContent(@Param('id') id: string) {
    return this.contentService.deleteContent(id);
  }

  @Post('generate')
  async generateContent(
    @Body()
    body: {
      topic: string;
      contentType: string;
      tone: string;
      targetKeywords?: string[];
    },
  ) {
    return this.contentService.generateContent(body);
  }

  @Patch(':id/publish')
  async publishContent(@Param('id') id: string, @Body('platforms') platforms: string[]) {
    return this.contentService.publishContent(id, platforms || []);
  }

  @Post('fetch-url-images')
  async fetchUrlImages(@Body() dto: FetchUrlImagesDto) {
    return this.contentService.fetchUrlImages(dto.url);
  }


//   @Post('generate-reference-creative')
// @UseInterceptors(FilesInterceptor('referenceFiles', 4))
// async generateReferenceCreative(
//   @UploadedFiles() files: Express.Multer.File[],
//   @Body() body: any,
// ) {
//   // Parse referenceImages if it's a JSON string
//   let referenceImages: string[] = [];
//   if (typeof body.referenceImages === 'string') {
//     try {
//       referenceImages = JSON.parse(body.referenceImages);
//     } catch {
//       referenceImages = [];
//     }
//   } else if (Array.isArray(body.referenceImages)) {
//     referenceImages = body.referenceImages;
//   }

//   return this.contentService.generateReferenceCreative({
//     prompt: body.prompt,
//     referenceImages: referenceImages,
//     productUrl: body.productUrl,
//     size: body.size,
//     quality: body.quality,
//     aspectRatio: body.aspectRatio,
//     imageCount: body.imageCount,
//     uploadedFiles: files,
//   });
// }

@Post('generate-reference-creative')
@UseInterceptors(FilesInterceptor('referenceFiles', 4))
async generateReferenceCreative(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: any,
) {
  return this.contentService.generateReferenceCreative({
    prompt: body.prompt,
    productUrl: body.productUrl,
    size: body.size,
    quality: body.quality,
    aspectRatio: body.aspectRatio,
    imageCount: body.imageCount,
    uploadedFiles: files,
  });
}

  @Patch(':id')
async updateContent(
  @Param('id') id: string,
  @Body()
  body: {
    title?: string;
    thumbnailUrl?: string;
    lifetimeStart?: string;
    lifetimeEnd?: string;
    status?: string;
  },
) {
  return this.contentService.updateContent(id, body);
}
}