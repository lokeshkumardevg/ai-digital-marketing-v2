export class CreateCampaignDto {
  name: string;
  prompt: string;
  contacts: { name: string; phone: string }[];
}
