const fs = require('fs');
const file = 'backend/src/campaigns/campaigns.controller.ts';
let code = fs.readFileSync(file, 'utf8');
if (!code.includes('@Post(\'meta/publish\')')) {
  const insertIndex = code.lastIndexOf('}');
  const newRoute = `
  @Post('meta/publish')
  async publishMeta(@Body() body: any) {
    return this.service.publishMetaCampaign(body.userId, body);
  }
`;
  code = code.slice(0, insertIndex) + newRoute + code.slice(insertIndex);
  fs.writeFileSync(file, code);
}
