import type { Rule, EmailTemplate, RuleViolation } from '../types.js';

/**
 * Checks for an unsubscribe link or footer.
 * Many corporate email gateways penalize bulk mail without opt-out links.
 */
const UNSUBSCRIBE_PATTERNS = [
  /unsubscribe/i,
  /opt.?out/i,
  /remove.{0,20}list/i,
  /List-Unsubscribe/i,
];

export const requireUnsubscribeLink: Rule = {
  id: 'require-unsubscribe-link',
  description: 'Template should include an unsubscribe or opt-out link for deliverability.',
  severity: 'warning',
  check(template: EmailTemplate): RuleViolation[] {
    const html = template.html ?? '';
    const hasUnsubscribe = UNSUBSCRIBE_PATTERNS.some((re) => re.test(html));
    if (!hasUnsubscribe) {
      return [{
        ruleId: 'require-unsubscribe-link',
        severity: 'warning',
        message:
          'No unsubscribe or opt-out link detected. Missing opt-out links can trigger ' +
          'spam filters and violate CAN-SPAM/GDPR requirements for test campaigns.',
      }];
    }
    return [];
  },
};
