import type { EmailTemplate, LintResult, Rule, RuleViolation } from './types.js';
import {
  noMissingTrackingPixel,
  requireMergeTag,
  requireUnsubscribeLink,
  noHighRiskSpamTriggers,
  requireTextVersion,
} from './rules/index.js';

const DEFAULT_RULES: Rule[] = [
  noHighRiskSpamTriggers,
  noMissingTrackingPixel,
  requireUnsubscribeLink,
  requireMergeTag,
  requireTextVersion,
];

/**
 * Lint an EmailTemplate against the default rule set.
 *
 * @example
 * const result = lint({ html: '<p>Hello {{.FirstName}}</p>', subject: 'Test' });
 * if (!result.passed) console.error(result.errors);
 */
export function lint(
  template: EmailTemplate,
  rules: Rule[] = DEFAULT_RULES
): LintResult {
  const violations: RuleViolation[] = rules.flatMap((rule) => rule.check(template));

  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');
  const suggestions = violations.filter((v) => v.severity === 'suggestion');

  return { errors, warnings, suggestions, passed: errors.length === 0 };
}
