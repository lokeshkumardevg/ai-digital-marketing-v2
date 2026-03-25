import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('contact')
  async createContact(@Body() body: any) {
    return this.crmService.createContact(body);
  }

  @Get('contacts')
  async getContacts() {
    return this.crmService.getAllContacts();
  }

  @Post('audience/generate')
  async generateAiAudience(@Body('goal') goal: string) {
    return this.crmService.generateAiAudience(goal);
  }

  @Get('audiences')
  async getAudiences() {
    return this.crmService.getAudiences();
  }

  @Patch('contact/:id/score')
  async scoreLead(@Param('id') contactId: string) {
    return this.crmService.scoreLead(contactId);
  }
}
