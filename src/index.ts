export { lint } from './lint.js';
export type { EmailTemplate, LintResult, Rule, RuleViolation, Severity } from './types.js';
export {
  noMissingTrackingPixel,
  requireMergeTag,
  requireUnsubscribeLink,
  noHighRiskSpamTriggers,
  requireTextVersion,
} from './rules/index.js';
