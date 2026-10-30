import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req, NotFoundException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentRegistryService, COWORKERS_META } from '../registry/agent-registry.service';
import { PlatformEventBusService } from '../event-bus/platform-event-bus.service';
import { CoworkerSchedulerService } from '../scheduler/coworker-scheduler.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Run, RunDocument } from '../schemas/run.schema';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

@Controller('v1/coworkers')
@UseGuards(AuthGuard('jwt'))
export class CoworkersController {
  private readonly logger = new Logger(CoworkersController.name);

  constructor(
    private readonly agentRegistry: AgentRegistryService,
    private readonly eventBus: PlatformEventBusService,
    private readonly scheduler: CoworkerSchedulerService,
    @InjectModel(Run.name)
    private readonly runModel: Model<RunDocument>,
  ) {}

  /**
   * Fleet health & live status endpoint for Admin Command Dashboard
   */
  @Get('admin/fleet-health')
  async getFleetHealth() {
    const allAgents = await this.agentRegistry.getAllAgents();

    let testReport: any = null;
    const pathsToTry = [
      path.resolve(process.cwd(), '../ai-agents/agent_test_report.json'),
      path.resolve(process.cwd(), 'ai-agents/agent_test_report.json'),
      path.resolve('/Users/mac/git_repo/ai_digital_live/ai-digital-marketing-v2/ai-agents/agent_test_report.json'),
    ];

    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        try {
          testReport = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        } catch {
          // ignore error
        }
      }
    }

    const testMap = new Map<string, any>();
    if (testReport?.results) {
      for (const r of testReport.results) {
        testMap.set(r.agent_id, r);
        const stripped = r.agent_id.replace(/^(max|stella|atlas|echo)_/, '');
        testMap.set(stripped, r);
      }
    }

    const agentsWithHealth = await Promise.all(
      allAgents.map(async (agent) => {
        const recentRun = await this.runModel
          .findOne({ agentId: agent.agentId })
          .sort({ createdAt: -1 })
          .lean()
          .exec();

        const testData = testMap.get(agent.agentId);

        let operationalStatus = 'healthy';
        if (agent.buildStatus === 'pending') {
          operationalStatus = 'pending';
        } else if (testData?.status === 'failed') {
          operationalStatus = 'error';
        } else if (testData?.status === 'escalated') {
          operationalStatus = 'escalated';
        }

        return {
          ...agent,
          operationalStatus,
          lastTest: testData || null,
          lastRun: recentRun
            ? {
                runId: recentRun.runId,
                status: recentRun.status,
                startedAt: recentRun.startedAt,
                completedAt: recentRun.completedAt,
                error: recentRun.error,
              }
            : null,
        };
      }),
    );

    const healthyCount = agentsWithHealth.filter((a) => a.operationalStatus === 'healthy').length;
    const errorCount = agentsWithHealth.filter((a) => a.operationalStatus === 'error').length;
    const pendingCount = agentsWithHealth.filter((a) => a.operationalStatus === 'pending').length;

    return {
      success: true,
      summary: {
        total: agentsWithHealth.length,
        healthy: healthyCount,
        error: errorCount,
        pending: pendingCount,
        healthPercentage: Math.round((healthyCount / (agentsWithHealth.length || 1)) * 100),
        testedAt: testReport?.generated_at || new Date().toISOString(),
      },
      agents: agentsWithHealth,
    };
  }

  /**
   * Run instantaneous health check on all agents via test runner
   */
  @Post('admin/run-health-check')
  async runFleetHealthCheck() {
    const scriptsToTry = [
      path.resolve(process.cwd(), '../ai-agents/test_runner.py'),
      path.resolve(process.cwd(), 'ai-agents/test_runner.py'),
      path.resolve('/Users/mac/git_repo/ai_digital_live/ai-digital-marketing-v2/ai-agents/test_runner.py'),
    ];

    let targetScript: string | null = null;
    for (const s of scriptsToTry) {
      if (fs.existsSync(s)) {
        targetScript = s;
        break;
      }
    }

    if (targetScript) {
      try {
        const workingDir = path.dirname(targetScript);
        const execPromise = promisify(exec);
        await execPromise(`python3 ${targetScript}`, {
          cwd: workingDir,
          env: { ...process.env, PYTHONPATH: workingDir },
        });
      } catch (err: any) {
        this.logger.error(`Error running test_runner.py: ${err.message}`);
      }
    }

    return this.getFleetHealth();
  }

  /**
   * Manually trigger any autonomous scheduled background task on demand
   */
  @Post('admin/trigger-schedule/:taskName')
  async triggerScheduleTask(
    @Req() req: any,
    @Param('taskName') taskName: string,
    @Body() body: Record<string, any>,
  ) {
    const orgId = req.user?.id || req.user?._id || 'manual_admin';
    return this.scheduler.triggerCycleNow(taskName, orgId, body);
  }

  /**
   * Onboarding Auto-Discovery Trigger
   * When a new client connects their website & platforms, runs instant deep research & audit.
   */
  @Post('onboard-discovery')
  async runOnboardDiscovery(
    @Req() req: any,
    @Body() body: { websiteUrl: string; competitors?: string[]; brandName?: string; industry?: string },
  ) {
    const orgId = req.user?.id || req.user?._id || 'new_client';
    const brandName = body.brandName || 'New Client Brand';
    const industry = body.industry || 'General Business';

    this.logger.log(`Starting Instant AI Onboarding Discovery for ${brandName} (${body.websiteUrl})`);

    // 1. Trigger Deep Research (Max)
    await this.eventBus.publish({
      eventType: 'campaign.schedule',
      idempotencyKey: `onboard_research_${Date.now()}`,
      orgId,
      payload: {
        brand_name: brandName,
        website_url: body.websiteUrl,
        competitors: body.competitors || ['Top Competitor A', 'Top Competitor B'],
        industry,
      },
    });

    // 2. Trigger Policy Sentinel Check (Echo)
    await this.eventBus.publish({
      eventType: 'policy.audit_scheduled',
      idempotencyKey: `onboard_policy_${Date.now()}`,
      orgId,
      payload: {
        industry,
        platforms: ['google', 'meta', 'whatsapp'],
      },
    });

    return {
      success: true,
      message: `Onboarding discovery kicked off! Max is researching competitors and Echo is auditing policy compliance.`,
      brandName,
      status: 'analyzing',
    };
  }

  @Get()
  async listCoworkers(@Req() req: any) {
    const orgId = req.user?.id || req.user?._id;
    const allAgents = await this.agentRegistry.getAllAgents();

    const result = Object.values(COWORKERS_META).map((meta) => {
      const agents = allAgents.filter((a) => a.coworker === meta.id);
      const builtCount = agents.filter((a) => a.buildStatus === 'built').length;
      const partialCount = agents.filter((a) => a.buildStatus === 'partial').length;
      const pendingCount = agents.filter((a) => a.buildStatus === 'pending').length;

      return {
        ...meta,
        totalAgents: agents.length,
        builtCount,
        partialCount,
        pendingCount,
      };
    });

    return { coworkers: result };
  }

  @Get(':id')
  async getCoworkerDetail(@Req() req: any, @Param('id') coworkerId: string) {
    const orgId = req.user?.id || req.user?._id;
    const cid = coworkerId.toLowerCase() as 'max' | 'stella' | 'atlas' | 'echo';
    const meta = this.agentRegistry.getCoworkerMeta(cid);
    if (!meta) throw new NotFoundException(`Coworker '${coworkerId}' not found`);

    const agents = await this.agentRegistry.getAllAgents(cid);

    // Attach user settings to each agent
    const agentsWithSettings = await Promise.all(
      agents.map(async (agent) => {
        const settings = await this.agentRegistry.getAgentSettings(orgId, agent.agentId);
        return {
          ...agent,
          settings,
        };
      }),
    );

    // Fetch recent runs for this coworker
    const recentRuns = await this.runModel
      .find({ orgId, coworker: cid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    return {
      coworker: meta,
      agents: agentsWithSettings,
      recentRuns,
    };
  }

  @Patch('agents/:agentId/settings')
  async updateSettings(
    @Req() req: any,
    @Param('agentId') agentId: string,
    @Body() body: { mode?: 'approval' | 'auto' | 'disabled'; dailyBudgetCap?: number; dryRunOnly?: boolean },
  ) {
    const orgId = req.user?.id || req.user?._id;
    return this.agentRegistry.updateAgentSettings(orgId, agentId, body);
  }

  /**
   * Plain-English task runner for coworker.
   * e.g. User types: "Audit our current Meta ad budget and suggest bid reductions"
   */
  @Post(':id/tasks')
  async runPlainEnglishTask(
    @Req() req: any,
    @Param('id') coworkerId: string,
    @Body() body: { instruction: string },
  ) {
    const orgId = req.user?.id || req.user?._id;
    const cid = coworkerId.toLowerCase();

    // Map coworker to trigger event
    let eventType = 'campaign.schedule';
    if (cid === 'stella') eventType = 'review.created';
    if (cid === 'atlas') eventType = 'call.received';
    if (cid === 'echo') eventType = 'feedback.analyzed';

    const res = await this.eventBus.publish({
      eventType,
      idempotencyKey: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      orgId,
      payload: {
        taskInstruction: body.instruction,
        assignedCoworker: cid,
        requestedBy: req.user?.email,
      },
    });

    return {
      success: true,
      message: `Task assigned to ${coworkerId.toUpperCase()}. Agent will generate action proposal.`,
      event: res.event,
    };
  }
}

