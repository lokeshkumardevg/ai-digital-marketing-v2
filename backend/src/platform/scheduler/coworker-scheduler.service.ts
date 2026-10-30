import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlatformEventBusService } from '../event-bus/platform-event-bus.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../schemas/agent.schema';

@Injectable()
export class CoworkerSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CoworkerSchedulerService.name);

  constructor(
    private readonly eventBus: PlatformEventBusService,
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  onModuleInit() {
    this.logger.log('Coworker Autonomous Scheduler initialized with background crons.');
  }

  /**
   * 1. HOURLY: Ad Campaign Budget & Anomaly Check (Max)
   * Runs every 4 hours to optimize ad spend, detect high-performing ad sets, and flag budget shifts.
   */
  @Cron('0 */4 * * *')
  async runAdBudgetAuditCron() {
    this.logger.log('[CRON: MAX] Running 4-hour Ad Campaign optimization and budget check...');
    try {
      await this.eventBus.publish({
        eventType: 'campaign.schedule',
        idempotencyKey: `cron_ads_${new Date().toISOString().slice(0, 13)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: 'ad_budget_optimization',
          objective: 'conversions',
          lookbackHours: 4,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runAdBudgetAuditCron: ${err.message}`);
    }
  }

  /**
   * 2. DAILY 8:00 AM: Social Content Auto-Publishing (Stella)
   * Prepares daily engaging social posts across Instagram, Facebook, LinkedIn.
   */
  @Cron('0 8 * * *')
  async runDailySocialPublishingCron() {
    this.logger.log('[CRON: STELLA] Running 8:00 AM Daily Social Publishing check...');
    try {
      await this.eventBus.publish({
        eventType: 'social.schedule',
        idempotencyKey: `cron_social_${new Date().toISOString().slice(0, 10)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: 'daily_social_post',
          platforms: ['instagram', 'facebook', 'linkedin'],
          topic: 'Daily patient care tip and business updates',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runDailySocialPublishingCron: ${err.message}`);
    }
  }

  /**
   * 3. DAILY 9:00 AM: Appointment Reminders & No-Show Prevention (Atlas)
   * Checks upcoming appointments for the next 24 hours and dispatches WhatsApp reminders.
   */
  @Cron('0 9 * * *')
  async runDailyAppointmentRemindersCron() {
    this.logger.log('[CRON: ATLAS] Running 9:00 AM Appointment Reminder & Waitlist check...');
    try {
      await this.eventBus.publish({
        eventType: 'appointments.reminder_check',
        idempotencyKey: `cron_reminders_${new Date().toISOString().slice(0, 10)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: '24h_reminders_dispatch',
          reminderType: '24h',
          channel: 'whatsapp',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runDailyAppointmentRemindersCron: ${err.message}`);
    }
  }

  /**
   * 4. WEEKLY MONDAY 9:00 AM: Competitor Benchmark & Review Velocity (Echo)
   * Tracks competitor ratings, review velocity, and content gaps.
   */
  @Cron('0 9 * * 1')
  async runWeeklyCompetitorAnalysisCron() {
    this.logger.log('[CRON: ECHO] Running Monday 9:00 AM Competitor Analysis...');
    try {
      await this.eventBus.publish({
        eventType: 'competitor.audit_scheduled',
        idempotencyKey: `cron_comp_${new Date().toISOString().slice(0, 10)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: 'weekly_competitor_tracking',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runWeeklyCompetitorAnalysisCron: ${err.message}`);
    }
  }

  /**
   * 5. WEEKLY FRIDAY 6:00 PM: Executive KPI Narrative & Briefing Deck (Echo)
   * Compiles outcome metrics across all 4 coworkers into an executive summary.
   */
  @Cron('0 18 * * 5')
  async runWeeklyExecutiveReportCron() {
    this.logger.log('[CRON: ECHO] Running Friday 6:00 PM Executive Weekly Report compilation...');
    try {
      await this.eventBus.publish({
        eventType: 'report.scheduled',
        idempotencyKey: `cron_report_${new Date().toISOString().slice(0, 10)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: 'executive_weekly_briefing',
          reportType: 'weekly',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runWeeklyExecutiveReportCron: ${err.message}`);
    }
  }

  /**
   * 6. BI-WEEKLY SUNDAY MIDNIGHT: Platform Policy & Compliance Watchdog (Echo)
   * Checks Meta, Google, WhatsApp, and Twilio regulatory compliance.
   */
  @Cron('0 0 * * 0')
  async runPlatformPolicyWatchdogCron() {
    this.logger.log('[CRON: ECHO] Running Weekly Platform Policy Regulatory Sentinel...');
    try {
      await this.eventBus.publish({
        eventType: 'policy.audit_scheduled',
        idempotencyKey: `cron_policy_${new Date().toISOString().slice(0, 10)}`,
        orgId: 'system_auto',
        payload: {
          scheduledTask: 'regulatory_compliance_sentinel',
          platforms: ['google', 'meta', 'whatsapp', 'twilio', 'linkedin'],
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      this.logger.error(`Error in runPlatformPolicyWatchdogCron: ${err.message}`);
    }
  }

  /**
   * Manual or On-Demand Trigger for any scheduled cycle (used by Admin/User UI).
   */
  async triggerCycleNow(taskName: string, orgId = 'system_manual', customPayload: Record<string, any> = {}) {
    this.logger.log(`Manual trigger requested for task: ${taskName} (Org: ${orgId})`);

    let eventType = 'campaign.schedule';
    switch (taskName) {
      case 'social_post':
        eventType = 'social.schedule';
        break;
      case 'reminders':
        eventType = 'appointments.reminder_check';
        break;
      case 'competitor':
        eventType = 'competitor.audit_scheduled';
        break;
      case 'report':
        eventType = 'report.scheduled';
        break;
      case 'policy_audit':
        eventType = 'policy.audit_scheduled';
        break;
      default:
        eventType = 'campaign.schedule';
    }

    const res = await this.eventBus.publish({
      eventType,
      idempotencyKey: `manual_${taskName}_${Date.now()}`,
      orgId,
      payload: {
        taskName,
        triggeredManually: true,
        ...customPayload,
      },
    });

    return {
      success: true,
      message: `Triggered cycle '${taskName}' successfully via event '${eventType}'.`,
      event: res.event,
    };
  }
}

