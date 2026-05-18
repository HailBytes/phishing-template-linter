import type { Rule, EmailTemplate, RuleViolation } from '../types.js';

/**
 * Flags words/phrases that consistently score high on SpamAssassin and
 * similar filters. This is a curated subset — not exhaustive.
 */
const HIGH_RISK_TRIGGERS: string[] = [
  'click here',
  'free offer',
  'you have been selected',
  'act now',
  'limited time',
  'guaranteed',
  'no risk',
  'winner',
  'congratulations',
  '100% free',
  'cash bonus',
  'earn extra cash',
  'risk free',
  'double your',
  'increase sales',
  'this is not spam',
  'you are a winner',
];

export const noHighRiskSpamTriggers: Rule = {
  id: 'no-high-risk-spam-triggers',
  description: 'Flags phrases that frequently trigger spam filters.',
  severity: 'error',
  check(template: EmailTemplate): RuleViolation[] {
    const combined = [
      template.html ?? '',
      template.subject ?? '',
      template.text ?? '',
    ].join(' ').toLowerCase();

    const found = HIGH_RISK_TRIGGERS.filter((trigger) =>
      combined.includes(trigger.toLowerCase())
    );

    return found.map((trigger) => ({
      ruleId: 'no-high-risk-spam-triggers',
      severity: 'error' as const,
      message: `High-risk spam trigger phrase detected: "${trigger}". This phrase commonly causes email rejection or spam-folder placement.`,
    }));
  },
};
