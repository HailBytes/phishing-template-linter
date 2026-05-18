/**
 * A GoPhish-compatible email template.
 */
export interface EmailTemplate {
  /** Raw HTML body of the email */
  html: string;
  /** Plain-text body (optional) */
  text?: string;
  /** Email subject line */
  subject?: string;
  /** Sender display name or address */
  from?: string;
}

export type Severity = 'error' | 'warning' | 'suggestion';

export interface RuleViolation {
  ruleId: string;
  severity: Severity;
  message: string;
  /** Optional line number in the HTML where the violation was found */
  line?: number;
}

export interface LintResult {
  errors: RuleViolation[];
  warnings: RuleViolation[];
  suggestions: RuleViolation[];
  /** true if no errors (warnings/suggestions are acceptable) */
  passed: boolean;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  check(template: EmailTemplate): RuleViolation[];
}
