#!/usr/bin/env node
import { readFileSync, statSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { lint } from './lint.js';
import type { EmailTemplate } from './types.js';

type OutputFormat = 'text' | 'json';

interface LintFileResult {
  file: string;
  passed: boolean;
  errors: { ruleId: string; severity: string; message: string }[];
  warnings: { ruleId: string; severity: string; message: string }[];
  suggestions: { ruleId: string; severity: string; message: string }[];
}

function printHelp(): void {
  console.log(`
Usage: phishing-lint [options] <file.html|directory> [file2.html ...]

Lints GoPhish-compatible HTML email templates for:
  - High-risk spam trigger phrases
  - Missing tracking pixels ({{.Tracker}})
  - Missing unsubscribe links
  - Missing personalization merge tags
  - Missing plain-text version

Options:
  --format <text|json>   Output format (default: text)
  --help, -h             Show this help message

Examples:
  phishing-lint ./templates/welcome.html
  phishing-lint ./templates/*.html
  phishing-lint ./templates/ --format json
  --help
`.trim());
}

function isHtmlFile(name: string): boolean {
  return /\.html?$/i.test(name);
}

function collectFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    const resolved = resolve(p);
    try {
      const stat = statSync(resolved);
      if (stat.isDirectory()) {
        const entries = readdirSync(resolved);
        for (const entry of (entries as string[]).sort()) {
          if (isHtmlFile(entry)) {
            files.push(resolve(resolved, entry));
          }
        }
      } else {
        files.push(resolved);
      }
    } catch {
      files.push(resolved);
    }
  }
  return files;
}

const rawArgs = process.argv.slice(2);

const filePaths: string[] = [];
let format: OutputFormat = 'text';

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
  if (arg === '--format') {
    const next = rawArgs[i + 1];
    if (next === 'json' || next === 'text') {
      format = next;
      i++;
    } else {
      console.error(`[ERROR] Invalid --format value: "${next ?? ''}". Expected "text" or "json".`);
      process.exit(1);
    }
  } else if (arg.startsWith('--format=')) {
    const val = arg.slice('--format='.length);
    if (val === 'json' || val === 'text') {
      format = val;
    } else {
      console.error(`[ERROR] Invalid --format value: "${val}". Expected "text" or "json".`);
      process.exit(1);
    }
  } else {
    filePaths.push(arg);
  }
}

if (filePaths.length === 0) {
  console.error('[ERROR] No files or directories specified. Use --help for usage information.');
  process.exit(1);
}

const files = collectFiles(filePaths);

if (files.length === 0) {
  console.error('[ERROR] No .html files found in specified paths.');
  process.exit(1);
}

let overallPassed = true;
const jsonResults: LintFileResult[] = [];

for (const filePath of files) {
  const displayPath = basename(filePath);
  let html: string;

  try {
    html = readFileSync(filePath, 'utf-8');
  } catch {
    if (format === 'json') {
      jsonResults.push({
        file: filePath,
        passed: false,
        errors: [{ ruleId: 'cli', severity: 'error', message: `Cannot read file: ${filePath}` }],
        warnings: [],
        suggestions: [],
      });
    } else {
      console.error(`\n[ERROR] Cannot read file: ${filePath}`);
    }
    overallPassed = false;
    continue;
  }

  const template: EmailTemplate = { html };
  const result = lint(template);

  if (format === 'json') {
    jsonResults.push({
      file: filePath,
      passed: result.passed,
      errors: result.errors.map((v) => ({ ruleId: v.ruleId, severity: v.severity, message: v.message })),
      warnings: result.warnings.map((v) => ({ ruleId: v.ruleId, severity: v.severity, message: v.message })),
      suggestions: result.suggestions.map((v) => ({ ruleId: v.ruleId, severity: v.severity, message: v.message })),
    });
  } else {
    console.log(`\u2500\u2500 ${displayPath} \u2500\u2500`);

    if (result.errors.length === 0 && result.warnings.length === 0 && result.suggestions.length === 0) {
      console.log('  \u2705  No issues found.');
      continue;
    }

    for (const v of result.errors) {
      console.error(`  \u274C  [error]      ${v.ruleId}: ${v.message}`);
    }
    for (const v of result.warnings) {
      console.warn(`  \u26A0\uFE0F  [warning]    ${v.ruleId}: ${v.message}`);
    }
    for (const v of result.suggestions) {
      console.log(`  \u{1F4A1}  [suggestion] ${v.ruleId}: ${v.message}`);
    }
  }

  if (!result.passed) overallPassed = false;
}

if (format === 'json') {
  const output = {
    passed: overallPassed,
    files: jsonResults,
    summary: {
      total: jsonResults.length,
      passed: jsonResults.filter((r) => r.passed).length,
      failed: jsonResults.filter((r) => !r.passed).length,
      errors: jsonResults.reduce((n, r) => n + r.errors.length, 0),
      warnings: jsonResults.reduce((n, r) => n + r.warnings.length, 0),
      suggestions: jsonResults.reduce((n, r) => n + r.suggestions.length, 0),
    },
  };
  console.log(JSON.stringify(output, null, 2));
}

process.exit(overallPassed ? 0 : 1);
