import { PolicyService } from './policy/policy.service';
import { Agent } from './schemas/agent.schema';
import { AgentSettings } from './schemas/agent-settings.schema';

describe('Platform Layer: PolicyService Unit Tests', () => {
  let policyService: PolicyService;

  beforeEach(() => {
    policyService = new PolicyService();
  });

  const mockAgent: Agent = {
    agentId: 'review_response',
    coworker: 'stella',
    name: 'Review Response Agent',
    domain: 'Presence',
    description: 'Drafts responses to reviews',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'review.created' },
    inputs: ['review_text', 'star_rating'],
    tools: ['google_business.post_reply'],
    policy: {
      default_mode: 'approval',
      escalate_if: ['rating<=2', 'legal_threat', 'refund_request'],
      block_if: ['contains_personal_data'],
    },
    output: { action: 'publish_review_reply', log: true },
    evaluation: { dataset: 'review_benchmarks', min_score: 0.85 },
    enabled: true,
    icon: 'MessageSquare',
  };

  const defaultSettings: AgentSettings = {
    orgId: 'org_test_123',
    locationId: 'default',
    agentId: 'review_response',
    mode: 'approval',
    dailyBudgetCap: 5000,
    escalateToEmail: 'admin@test.com',
    dryRunOnly: false,
  };

  it('should require approval for normal 5-star reviews when mode is approval', () => {
    const result = policyService.evaluate(mockAgent, defaultSettings, {
      actionType: 'publish_review_reply',
      payload: { rating: 5, review_text: 'Excellent service!' },
    });

    expect(result.decision).toBe('approval');
    expect(result.priority).toBe('medium');
  });

  it('should escalate to urgent priority when a 2-star review is processed', () => {
    const result = policyService.evaluate(mockAgent, defaultSettings, {
      actionType: 'publish_review_reply',
      payload: { rating: 2, review_text: 'Very slow delivery and poor response.' },
    });

    expect(result.decision).toBe('escalated');
    expect(result.priority).toBe('urgent');
    expect(result.reason).toContain('rating<=2');
  });

  it('should block proposed actions containing personal card data', () => {
    const result = policyService.evaluate(mockAgent, defaultSettings, {
      actionType: 'publish_review_reply',
      payload: { reply: 'Call us back at card 4532-1234-5678-9012' },
    });

    expect(result.decision).toBe('blocked');
    expect(result.priority).toBe('urgent');
    expect(result.reason).toContain('contains_personal_data');
  });

  it('should allow autonomous execution when agent mode is set to auto and no rules trigger', () => {
    const autoSettings: AgentSettings = {
      ...defaultSettings,
      mode: 'auto',
    };

    const result = policyService.evaluate(mockAgent, autoSettings, {
      actionType: 'publish_review_reply',
      payload: { rating: 5, review_text: 'Flawless experience!' },
    });

    expect(result.decision).toBe('auto');
    expect(result.priority).toBe('low');
  });
});

