const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { AnalyticsService } = require('./dist/src/analytics/analytics.service');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(AnalyticsService);
  
  // Test both dashboard and insights
  const dbMetrics = await service.getDashboardMetrics("6a1d324b5291a9f8db25ff2b");
  console.log("=== DASHBOARD METRICS ===");
  console.log(JSON.stringify(dbMetrics.summary, null, 2));
  
  const insights = await service.getAdInsights("linkedin", "6a1d324b5291a9f8db25ff2b");
  console.log("\n=== LINKEDIN INSIGHTS ===");
  console.log(JSON.stringify(insights.kpis, null, 2));
  console.log("Campaigns count:", insights.campaigns.length);

  await app.close();
}
main().catch(console.error);
