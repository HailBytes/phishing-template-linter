import { describe, it, expect, beforeAll } from 'vitest';
import { lint } from '../lint.js';
import type { EmailTemplate } from '../types.js';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

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
    expect(result.passed).toBe(true);
  });
});

// ─── CLI tests ───────────────────────────────────────────────────────

const CLI = resolve(__dirname, '../../dist/cli.js');
const TMP_DIR = '/tmp/phishing-linter-test';

function setupTestDir(): void {
  try { rmSync(TMP_DIR, { recursive: true }); } catch { /* ignore */ }
  mkdirSync(TMP_DIR, { recursive: true });

  writeFileSync(
    resolve(TMP_DIR, 'clean.html'),
    [
      '<html><body>',
      '<p>Hi {{.FirstName}},</p>',
      '<p><a href="{{.URL}}">link</a></p>',
      '<p><a href="#">Unsubscribe</a></p>',
      '<div>{{.Tracker}}</div>',
      '</body></html>',
    ].join('\n'),
    'utf-8'
  );

  writeFileSync(
    resolve(TMP_DIR, 'spammy.html'),
    [
      '<html><body>',
      '<p>Congratulations you are a winner!</p>',
      '</body></html>',
    ].join('\n'),
    'utf-8'
  );
}

interface CliResult {
  stdout: string;
  stderr: string;
  status: number;
}

function runCli(args: string): CliResult {
  interface ExecError extends Error {
    stdout?: string;
    stderr?: string;
    status?: number;
  }
  try {
    const stdout = execSync(`node ${CLI} ${args}`, { encoding: 'utf-8' });
    return { stdout, stderr: '', status: 0 };
  } catch (e) {
    const err = e as ExecError;
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      status: err.status ?? 1,
    };
  }
}

describe('CLI --format json', () => {
  beforeAll(() => {
    setupTestDir();
  });

  it('outputs valid JSON with --format json for a single clean file', () => {
    const { stdout, status } = runCli(`${TMP_DIR}/clean.html --format json`);
    expect(status).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.passed).toBe(true);
    expect(parsed.files).toHaveLength(1);
    expect(parsed.summary.total).toBe(1);
  });

  it('outputs valid JSON with --format json for a directory', () => {
    const { stdout, status } = runCli(`${TMP_DIR}/ --format json`);
    expect(status).not.toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.files.length).toBe(2);
    expect(parsed.summary.total).toBe(2);
    expect(parsed.summary.failed).toBeGreaterThanOrEqual(1);
  });

  it('reports file read errors in JSON output for missing files', () => {
    const { stdout, status } = runCli(`/nonexistent/file.html --format json`);
    expect(status).not.toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.passed).toBe(false);
    expect(parsed.files[0].errors[0].ruleId).toBe('cli');
  });

  it('outputs text by default when --format is omitted', () => {
    const { stdout } = runCli(`${TMP_DIR}/clean.html`);
    expect(stdout).toContain('clean.html');
  });

  it('errors on invalid --format value', () => {
    const { stderr, status } = runCli(`${TMP_DIR}/clean.html --format yaml`);
    expect(status).not.toBe(0);
    expect(stderr).toContain('Invalid --format');
  });

  it('handles --format=json equals syntax', () => {
    const { stdout } = runCli(`${TMP_DIR}/clean.html --format=json`);
    const parsed = JSON.parse(stdout);
    expect(parsed).toHaveProperty('passed');
    expect(parsed).toHaveProperty('files');
    expect(parsed).toHaveProperty('summary');
  });
});

describe('CLI directory handling', () => {
  it('processes .html files from multiple file args', () => {
    const { stdout } = runCli(`${TMP_DIR}/clean.html ${TMP_DIR}/spammy.html`);
    expect(stdout).toContain('clean.html');
    expect(stdout).toContain('spammy.html');
  });

  it('errors when no .html files found in directory', () => {
    const emptyDir = '/tmp/phishing-linter-empty';
    mkdirSync(emptyDir, { recursive: true });
    writeFileSync(resolve(emptyDir, 'readme.txt'), 'no html here');
    const { stderr, status } = runCli(emptyDir);
    expect(status).not.toBe(0);
    expect(stderr).toContain('No .html files found');
  });
});
