import type { Rule, EmailTemplate, RuleViolation } from '../types.js';

/**
 * Warns when no GoPhish personalization merge tags are present.
 * Phishing simulations are significantly more effective when personalized.
 */
const GOPHISH_MERGE_TAGS = [
  '{{.FirstName}}',
  '{{.LastName}}',
  '{{.Position}}',
  '{{.Email}}',
  '{{.From}}',
  '{{.URL}}',
];

export const requireMergeTag: Rule = {
  id: 'require-merge-tag',
  description: 'Template should use at least one GoPhish personalization merge tag.',
  severity: 'suggestion',
  check(template: EmailTemplate): RuleViolation[] {
    const combined = (template.html ?? '') + (template.subject ?? '') + (template.text ?? '');
    const found = GOPHISH_MERGE_TAGS.some((tag) => combined.includes(tag));
    if (!found) {
      return [{
        ruleId: 'require-merge-tag',
        severity: 'suggestion',
        message:
          `No GoPhish merge tags found. Consider adding personalization tags like ` +
          `{{.FirstName}} or {{.URL}} to improve click rates.`,
      }];
    }
    return [];
  },
};
