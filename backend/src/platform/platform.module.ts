import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { Agent, AgentSchema } from './schemas/agent.schema';
import { AgentSettings, AgentSettingsSchema } from './schemas/agent-settings.schema';
import { PlatformEvent, PlatformEventSchema } from './schemas/event.schema';
import { Run, RunSchema } from './schemas/run.schema';
import { Approval, ApprovalSchema } from './schemas/approval.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

// Services
import { AgentRegistryService } from './registry/agent-registry.service';
import { PlatformEventBusService } from './event-bus/platform-event-bus.service';
import { PolicyService } from './policy/policy.service';
import { AuditService } from './audit/audit.service';
import { ActionExecutorService } from './executors/action-executor.service';
import { ApprovalsService } from './approvals/approvals.service';
import { OrchestratorService } from './orchestrator/orchestrator.service';
import { CoworkerSchedulerService } from './scheduler/coworker-scheduler.service';

// Controllers
import { ApprovalsController } from './approvals/approvals.controller';
import { CoworkersController } from './coworkers/coworkers.controller';
import { AuditController } from './audit/audit.controller';

// Feature modules for executor wiring
import { ReviewsModule } from '../reviews/reviews.module';
import { CrmModule } from '../crm/crm.module';
import { SocialModule } from '../social/social.module';
import { CampaignModule } from '../campaigns/campaigns.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: AgentSettings.name, schema: AgentSettingsSchema },
      { name: PlatformEvent.name, schema: PlatformEventSchema },
      { name: Run.name, schema: RunSchema },
      { name: Approval.name, schema: ApprovalSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    ReviewsModule,
    CrmModule,
    SocialModule,
    CampaignModule,
  ],
  providers: [
    AgentRegistryService,
    PlatformEventBusService,
    PolicyService,
    AuditService,
    ActionExecutorService,
    ApprovalsService,
    OrchestratorService,
    CoworkerSchedulerService,
  ],
  controllers: [
    ApprovalsController,
    CoworkersController,
    AuditController,
  ],
  exports: [
    AgentRegistryService,
    PlatformEventBusService,
    ApprovalsService,
    ActionExecutorService,
    AuditService,
    CoworkerSchedulerService,
  ],
})
export class PlatformModule {}

