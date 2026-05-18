import { describe, it, expect } from 'vitest';
import { lint } from '../lint.js';
import type { EmailTemplate } from '../types.js';

const goodTemplate: EmailTemplate = {
  html: `
    <html><body>
      <p>Hi {{.FirstName}},</p>
      <p>Please review your account at <a href="{{.URL}}">review your account</a>.</p>
      <p><a href="#">Unsubscribe</a></p>
      <div>{{.Tracker}}</div>
    </body></html>
  `,
  subject: 'Action required: account review',
  text: 'Hi there, please review your account.',
};

describe('lint()', () => {
  it('passes a well-formed template with no errors', () => {
    const result = lint(goodTemplate);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for high-risk spam trigger in subject', () => {
    const template: EmailTemplate = {
      ...goodTemplate,
      subject: 'Congratulations — you are a winner!',
    };
    const result = lint(template);
    expect(result.errors.some((e) => e.ruleId === 'no-high-risk-spam-triggers')).toBe(true);
    expect(result.passed).toBe(false);
  });

  it('warns when {{.Tracker}} is missing', () => {
    const template: EmailTemplate = {
      ...goodTemplate,
      html: '<p>Hi {{.FirstName}}, <a href="{{.URL}}">link</a></p><p><a href="#">Unsubscribe</a></p>',
    };
    const result = lint(template);
    expect(result.warnings.some((w) => w.ruleId === 'no-missing-tracking-pixel')).toBe(true);
  });

  it('warns when unsubscribe link is missing', () => {
    const template: EmailTemplate = {
      ...goodTemplate,
      html: '<p>Hi {{.FirstName}}</p><div>{{.Tracker}}</div>',
    };
    const result = lint(template);
    expect(result.warnings.some((w) => w.ruleId === 'require-unsubscribe-link')).toBe(true);
  });

  it('suggests adding merge tags when none are present', () => {
    const template: EmailTemplate = {
      html: '<p>Hello team,</p><p><a href="#">Unsubscribe</a></p><div>{{.Tracker}}</div>',
      subject: 'Team update',
      text: 'Hello team',
    };
    const result = lint(template);
    expect(result.suggestions.some((s) => s.ruleId === 'require-merge-tag')).toBe(true);
  });

  it('suggests adding text version when missing', () => {
    const template: EmailTemplate = {
      ...goodTemplate,
      text: undefined,
    };
    const result = lint(template);
    expect(result.suggestions.some((s) => s.ruleId === 'require-text-version')).toBe(true);
  });

  it('returns LintResult shape with passed=true when only suggestions/warnings exist', () => {
    const template: EmailTemplate = {
      html: '<p>Hello {{.FirstName}}</p><p><a href="#">Unsubscribe</a></p><div>{{.Tracker}}</div>',
    };
    const result = lint(template);
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('suggestions');
    expect(result.passed).toBe(true); // only warnings/suggestions, no errors
  });
});
