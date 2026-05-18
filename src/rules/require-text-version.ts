import type { Rule, EmailTemplate, RuleViolation } from '../types.js';

/**
 * Multi-part MIME (HTML + plain text) improves deliverability.
 * GoPhish supports plain-text bodies.
 */
export const requireTextVersion: Rule = {
  id: 'require-text-version',
  description: 'Template should include a plain-text (MIME) version.',
  severity: 'suggestion',
  check(template: EmailTemplate): RuleViolation[] {
    if (!template.text || template.text.trim().length === 0) {
      return [{
        ruleId: 'require-text-version',
        severity: 'suggestion',
        message:
          'No plain-text version provided. Adding a text body improves deliverability ' +
          'for recipients whose mail clients prefer plain text.',
      }];
    }
    return [];
  },
};
