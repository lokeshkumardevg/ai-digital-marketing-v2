import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentRegistryService, COWORKERS_META } from '../registry/agent-registry.service';
import { PlatformEventBusService } from '../event-bus/platform-event-bus.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Run, RunDocument } from '../schemas/run.schema';

@Controller('v1/coworkers')
@UseGuards(AuthGuard('jwt'))
export class CoworkersController {
  constructor(
    private readonly agentRegistry: AgentRegistryService,
    private readonly eventBus: PlatformEventBusService,
    @InjectModel(Run.name)
    private readonly runModel: Model<RunDocument>,
  ) {}

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

