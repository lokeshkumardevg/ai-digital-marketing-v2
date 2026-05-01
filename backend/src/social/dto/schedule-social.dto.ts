import { IsDateString, IsNotEmpty } from 'class-validator';
import { PublishSocialDto } from './publish-social.dto';

export class ScheduleSocialDto extends PublishSocialDto {
  @IsDateString()
  @IsNotEmpty()
  scheduledFor: string;
}
