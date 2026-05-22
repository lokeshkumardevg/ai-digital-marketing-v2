/**
 * PlatformPromptService
 *
 * NOTE: Image edit prompts are now built directly inside ImageGeneratorService
 * using the Images Edit API (gpt-image-1 with image input).
 *
 * This service is retained for any future text-prompt-only generation fallback
 * or for generating content prompts outside the main pipeline.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformPromptService {}