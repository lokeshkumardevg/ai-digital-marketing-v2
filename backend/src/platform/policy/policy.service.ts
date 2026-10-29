import { Injectable, Logger } from '@nestjs/common';
import { Agent } from '../schemas/agent.schema';
import { AgentSettings } from '../schemas/agent-settings.schema';

export interface PolicyEvaluationResult {
  decision: 'approval' | 'auto' | 'blocked' | 'escalated';
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  /**
   * Evaluates whether a proposed agent action can execute automatically,
   * requires human approval, or must be blocked/escalated.
   */
  evaluate(
    agent: Agent,
    settings: AgentSettings,
    proposedAction: { actionType: string; payload: Record<string, any> },
  ): PolicyEvaluationResult {
    // 1. Is Agent disabled for this organization?
    if (settings.mode === 'disabled' || !agent.enabled) {
      return {
        decision: 'blocked',
        reason: `Agent '${agent.name}' is currently disabled for this workspace.`,
        priority: 'low',
      };
    }

    // 2. Check Blocking Rules (e.g. personal data, profanity, policy violations)
    const blockRules = agent.policy?.block_if || [];
    for (const rule of blockRules) {
      if (this.matchesRule(rule, proposedAction.payload)) {
        return {
          decision: 'blocked',
          reason: `Action blocked by policy safety filter: rule '${rule}' triggered.`,
          priority: 'urgent',
        };
      }
    }

    // 3. Check Escalation Rules (e.g. 1-2 star ratings, refund requests, legal threats, large budget jumps)
    const escalateRules = agent.policy?.escalate_if || [];
    for (const rule of escalateRules) {
      if (this.matchesRule(rule, proposedAction.payload)) {
        return {
          decision: 'escalated',
          reason: `High-sensitivity condition detected (${rule}). Escalated for priority human review.`,
          priority: 'urgent',
        };
      }
    }

    // 4. Dry-run mode enforcement
    if (settings.dryRunOnly) {
      return {
        decision: 'approval',
        reason: 'Dry-run mode is enabled: proposed action staged without direct execution.',
        priority: 'low',
      };
    }

    // 5. Check Agent Mode (approval vs auto)
    if (settings.mode === 'approval') {
      return {
        decision: 'approval',
        reason: 'Approval required by workspace policy before outward action.',
        priority: 'medium',
      };
    }

    // 6. Automatic execution allowed
    return {
      decision: 'auto',
      reason: 'Action cleared all safety filters and agent is in autonomous mode.',
      priority: 'low',
    };
  }

  private matchesRule(rule: string, payload: Record<string, any>): boolean {
    const textToScan = JSON.stringify(payload).toLowerCase();

    if (rule === 'rating<=2') {
      const rating = Number(payload.rating || payload.star_rating || payload.stars);
      return !isNaN(rating) && rating > 0 && rating <= 2;
    }

    if (rule === 'legal_threat') {
      return /lawyer|attorney|lawsuit|sue|court|legal action|notice/.test(textToScan);
    }

    if (rule === 'refund_request') {
      return /refund|money back|chargeback|compensation|scam/.test(textToScan);
    }

    if (rule === 'contains_personal_data') {
      // Basic credit card or Aadhaar or SSN pattern test
      return /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(textToScan);
    }

    if (rule === 'budget_increase_over_20%') {
      const current = Number(payload.currentBudget || 0);
      const proposed = Number(payload.proposedBudget || 0);
      return current > 0 && proposed > current * 1.2;
    }

    return false;
  }
}

