const fs = require('fs');
const file = 'backend/src/campaigns/campaigns.service.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('UsersService')) {
  // Insert import
  code = "import { UsersService } from '../users/users.service';\n" + code;
  
  // Inject into constructor
  code = code.replace(
    /constructor\(\s*@InjectModel\('Session'\)/,
    "constructor(\n    private usersService: UsersService,\n    @InjectModel('Session')"
  );

  // Add the method
  const methodCode = `
  async publishMetaCampaign(userId: string, data: any) {
    this.logger.log(\`Publishing Meta Campaign for \${userId}\`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (!user.metaAccessToken || !user.metaAdAccountId) {
      throw new BadRequestException('Meta Account not fully connected or Ad Account missing.');
    }

    const { campaignName, dailyBudget, objective } = data;
    const adAccountId = user.metaAdAccountId;
    const token = user.metaAccessToken;

    try {
      // 1. Create a Campaign
      const campResponse = await axios.post(
        \`https://graph.facebook.com/v20.0/\${adAccountId}/campaigns\`,
        {
          name: campaignName || 'AI Generated Campaign',
          objective: objective || 'OUTCOME_TRAFFIC', // default to traffic
          status: 'PAUSED', // Create as draft
          special_ad_categories: [], // Required by FB
          daily_budget: (dailyBudget || 10) * 100, // Budget in cents
          access_token: token,
        }
      );

      const campaignId = campResponse.data.id;

      return {
        success: true,
        message: 'Campaign Draft created successfully in Meta Ads Manager.',
        campaignId,
      };

    } catch (err: any) {
      this.logger.error('Meta API Error: ' + err.response?.data?.error?.message || err.message);
      throw new InternalServerErrorException(err.response?.data?.error?.message || 'Failed to create Meta campaign.');
    }
  }
`;
  const insertIndex = code.lastIndexOf('}');
  code = code.slice(0, insertIndex) + methodCode + code.slice(insertIndex);

  fs.writeFileSync(file, code);
}
