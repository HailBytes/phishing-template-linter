import type { Rule, EmailTemplate, RuleViolation } from '../types.js';

/**
 * Checks that the template includes GoPhish's {{.Tracker}} merge tag,
 * which renders the 1x1 tracking pixel. Without it, open-tracking is broken.
 */
export const noMissingTrackingPixel: Rule = {
  id: 'no-missing-tracking-pixel',
  description: 'Template must include the GoPhish {{.Tracker}} open-tracking pixel.',
  severity: 'warning',
  check(template: EmailTemplate): RuleViolation[] {
    if (!template.html.includes('{{.Tracker}}')) {
      return [{
        ruleId: 'no-missing-tracking-pixel',
        severity: 'warning',
        message:
          'Missing {{.Tracker}} tag. GoPhish will not record email opens without it. ' +
          'Add <div>{{.Tracker}}</div> just before </body>.',
      }];
    }
    return [];
  },
};
