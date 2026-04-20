import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FetchUrlImagesDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl(
    {
      require_tld: false,
      require_protocol: true,
    },
    { message: 'Please provide a valid website URL with http/https.' },
  )
  url: string;
}