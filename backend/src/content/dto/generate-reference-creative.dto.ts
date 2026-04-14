export class GenerateReferenceCreativeDto {
  prompt!: string;
  referenceImages!: string[];
  productUrl?: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}