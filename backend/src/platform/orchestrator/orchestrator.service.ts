import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { PlatformEventBusService } from '../event-bus/platform-event-bus.service';
import { AgentRegistryService } from '../registry/agent-registry.service';
import { PolicyService } from '../policy/policy.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { ActionExecutorService } from '../executors/action-executor.service';
import { AuditService } from '../audit/audit.service';
import { Run, RunDocument } from '../schemas/run.schema';
import { PlatformEvent } from '../schemas/event.schema';

@Injectable()
export class OrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(OrchestratorService.name);
  private openai: OpenAI;

  constructor(
    private readonly eventBus: PlatformEventBusService,
    private readonly agentRegistry: AgentRegistryService,
    private readonly policyService: PolicyService,
    private readonly approvalsService: ApprovalsService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly auditService: AuditService,
    @InjectModel(Run.name)
    private readonly runModel: Model<RunDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock_openai_key',
    });
  }

  onModuleInit() {
    this.eventBus.subscribe(async (event: PlatformEvent) => {
      await this.handleEvent(event);
    });
    this.logger.log('Platform Orchestrator subscribed to normalized Event Bus.');
  }

  /**
   * Main agent loop: Event -> Brain Proposes -> Policy Gate -> Approvals/Auto -> Executor -> Audit
   */
  async handleEvent(event: PlatformEvent) {
    this.logger.log(`[ORCHESTRATOR] Processing event ${event.eventType} (Key: ${event.idempotencyKey})`);

    // 1. Find matching agents for this event
    const allAgents = await this.agentRegistry.getAllAgents();
    const matchingAgents = allAgents.filter(
      (a) => a.trigger?.event === event.eventType && a.enabled,
    );

    if (matchingAgents.length === 0) {
      this.logger.debug(`No active agents configured for event ${event.eventType}`);
      return;
    }

    for (const agent of matchingAgents) {
      const runId = uuidv4();
      try {
        const settings = await this.agentRegistry.getAgentSettings(event.orgId, agent.agentId);

        // 2. Initialize Run trace
        const runRecord = new this.runModel({
          runId,
          agentId: agent.agentId,
          coworker: agent.coworker,
          orgId: event.orgId,
          locationId: event.locationId,
          eventId: event.eventId,
          status: 'running',
          promptVersion: agent.version || '1.0.0',
          model: 'gpt-4o-mini',
          contextUsed: event.payload,
          startedAt: new Date(),
        });
        await runRecord.save();

        // 3. Agent Brain: Generate proposed action
        const proposedAction = await this.generateAgentAction(agent, event.payload);

        runRecord.proposedAction = proposedAction;
        await runRecord.save();

        // 4. Policy Gate
        const policyResult = this.policyService.evaluate(agent, settings, proposedAction);
        this.logger.log(
          `[POLICY DECISION] Agent ${agent.agentId} -> ${policyResult.decision.toUpperCase()} (${policyResult.reason})`,
        );

        if (policyResult.decision === 'blocked') {
          runRecord.status = 'cancelled';
          runRecord.error = policyResult.reason;
          runRecord.completedAt = new Date();
          await runRecord.save();

          await this.auditService.log({
            orgId: event.orgId,
            locationId: event.locationId,
            runId,
            agentId: agent.agentId,
            action: 'agent.blocked',
            actor: { type: 'agent', id: agent.agentId, name: agent.name },
            details: { reason: policyResult.reason, payload: event.payload },
          });
          continue;
        }

        if (policyResult.decision === 'approval' || policyResult.decision === 'escalated') {
          // Send to Human Approval Queue
          await this.approvalsService.createApproval({
            runId,
            agentId: agent.agentId,
            coworker: agent.coworker,
            orgId: event.orgId,
            locationId: event.locationId,
            title: `${agent.name}: ${proposedAction.summary}`,
            description: policyResult.reason,
            actionType: proposedAction.actionType,
            priority: policyResult.priority,
            proposedData: proposedAction.payload,
            originalContext: event.payload,
          });

          await this.auditService.log({
            orgId: event.orgId,
            locationId: event.locationId,
            runId,
            agentId: agent.agentId,
            action: 'approval.requested',
            actor: { type: 'agent', id: agent.agentId, name: agent.name },
            details: { proposedAction, priority: policyResult.priority },
          });
          continue;
        }

        if (policyResult.decision === 'auto') {
          // Autonomous execution
          const execRes = await this.actionExecutor.execute({
            actionType: proposedAction.actionType,
            runId,
            agentId: agent.agentId,
            orgId: event.orgId,
            locationId: event.locationId,
            payload: proposedAction.payload,
            actor: { type: 'agent', id: agent.agentId, name: agent.name },
          });

          runRecord.status = execRes.success ? 'executed' : 'failed';
          runRecord.result = execRes.result;
          runRecord.error = execRes.error;
          runRecord.completedAt = new Date();
          await runRecord.save();
        }
      } catch (err: any) {
        this.logger.error(`Run ${runId} failed for agent ${agent.agentId}: ${err.message}`, err.stack);
        await this.runModel.findOneAndUpdate(
          { runId },
          { $set: { status: 'failed', error: err.message, completedAt: new Date() } },
        );
      }
    }
  }

  /**
   * Generates structured proposed actions based on agent specialty.
   * Directly bridges to Python FastAPI Microservice with resilient local fallback.
   */
  private async generateAgentAction(
    agent: any,
    payload: Record<string, any>,
  ): Promise<{ actionType: string; summary: string; targetId?: string; payload: any }> {
    // 1. Try invoking the dedicated Python AI microservice first
    const pythonEndpoint = process.env.AI_AGENTS_URL || 'http://localhost:8003';
    try {
      const response = await fetch(`${pythonEndpoint}/api/v1/agents/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coworker: agent.coworker,
          agent_id: agent.agentId,
          inputs: payload,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const result: any = await response.json();
        if (result && result.proposed_action?.actionType) {
          this.logger.log(`[PYTHON BRAIN DISPATCH] Agent ${agent.agentId} proposed action: ${result.proposed_action.actionType}`);
          return {
            actionType: result.proposed_action.actionType,
            summary: result.summary || `${agent.name} executed successfully`,
            targetId: result.proposed_action.payload?.targetId || payload.id || `act_${Date.now()}`,
            payload: result.proposed_action.payload || result.data || payload,
          };
        }
      }
    } catch {
      // Python service offline or test mode: smoothly fall back to local handlers
    }

    switch (agent.agentId) {
      // ── REVIEW RESPONSE AGENT ──
      case 'review_response': {
        const rating = Number(payload.rating || payload.star_rating || 5);
        const reviewText = payload.content || payload.text || payload.review_text || 'Great service!';
        const reviewer = payload.reviewerName || payload.authorName || 'Valued Customer';
        const reviewId = payload.reviewId || payload._id || `rev_${Date.now()}`;

        let draftReply = '';
        try {
          if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock_openai_key') {
            const prompt = `Act as an expert brand reputation manager. Draft a response to this ${rating}-star review: "${reviewText}".
If 1-3 stars, use HEART (Hear, Empathize, Apologize, Resolve, Diagnose).
If 4-5 stars, thank them warmly and amplify loyalty. Keep it under 60 words.`;
            const completion = await this.openai.chat.completions.create({
              model: 'gpt-4o-mini',
              temperature: 0.6,
              messages: [{ role: 'user', content: prompt }],
            });
            draftReply = completion.choices[0]?.message?.content?.trim() || '';
          }
        } catch (e: any) {
          this.logger.warn(`OpenAI call fallback: ${e.message}`);
        }

        if (!draftReply) {
          draftReply =
            rating >= 4
              ? `Thank you so much, ${reviewer}! We are thrilled to hear you had a great experience with our team.`
              : `Hello ${reviewer}, thank you for your candid feedback. We take this seriously and would love to resolve this with you directly. Please contact our support desk so we can make this right.`;
        }

        return {
          actionType: 'publish_review_reply',
          summary: `Drafted reply to ${rating}★ review from ${reviewer}`,
          targetId: reviewId,
          payload: {
            reviewId,
            reviewerName: reviewer,
            rating,
            reviewText,
            replyText: draftReply,
          },
        };
      }

      // ── ADS CAMPAIGN / ANOMALY AGENT ──
      case 'ads_campaign': {
        const campaignName = payload.campaignName || payload.name || 'Core Growth Campaign';
        const currentBudget = payload.currentBudget || payload.budget || 1000;
        const suggestedShift = payload.suggestedShift || 1.15;
        const newBudget = Math.round(currentBudget * suggestedShift);

        return {
          actionType: 'adjust_budget',
          summary: `Optimize budget for "${campaignName}" from $${currentBudget} to $${newBudget}`,
          targetId: payload.campaignId || `cmp_${Date.now()}`,
          payload: {
            campaignId: payload.campaignId,
            campaignName,
            currentBudget,
            newBudget,
            reason: 'High ROAS detected; scale budget by 15% to capture converting traffic.',
          },
        };
      }

      // ── LEAD GENERATION AGENT ──
      case 'lead_generation': {
        const leadName = payload.name || 'New Prospect';
        const contactId = payload.contactId || payload._id || `lead_${Date.now()}`;
        return {
          actionType: 'enrich_and_route_lead',
          summary: `Enrich and score incoming lead: ${leadName}`,
          targetId: contactId,
          payload: {
            contactId,
            leadName,
            phone: payload.phone,
            email: payload.email,
            source: payload.source || 'Website Form',
            assignedStage: 'Qualified',
          },
        };
      }

      // ── SOCIAL PUBLISHING AGENT ──
      case 'social_publishing': {
        const topic = payload.topic || 'Weekly AI Strategy & Digital Innovation';
        return {
          actionType: 'schedule_social_post',
          summary: `Scheduled thought-leadership post: "${topic}"`,
          payload: {
            content: `🚀 How autonomous AI agents are modernizing marketing workflows: 3 lessons every growth leader needs to know.\n\n#DigitalMarketing #Growth #AIAutomation`,
            platforms: ['linkedin', 'facebook', 'twitter'],
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          },
        };
      }

      default: {
        return {
          actionType: agent.output?.action || 'execute_task',
          summary: `${agent.name} generated action proposal`,
          payload: { ...payload, processedAt: new Date() },
        };
      }
    }
  }
}

