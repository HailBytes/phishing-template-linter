#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { lint } from './lint.js';
import type { EmailTemplate, LintResult } from './types.js';

const args = process.argv.slice(2);

// Parse --format flag
let format: 'text' | 'json' = 'text';
const files: string[] = [];
for (const arg of args) {
  if (arg === '--format' || arg === '-f') {
    // next arg is the format value
    continue;
  }
  if (args[args.indexOf(arg) - 1] === '--format' || args[args.indexOf(arg) - 1] === '-f') {
    if (arg === 'json' || arg === 'text') {
      format = arg;
    } else {
      console.error(`Unknown format: ${arg}. Supported: text, json`);
      process.exit(2);
    }
    continue;
  }
  files.push(arg);
}

if (files.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: phishing-lint <file.html> [file2.html ...] [--format json|text]

Lints GoPhish-compatible HTML email templates for:
  - High-risk spam trigger phrases
  - Missing tracking pixels ({{.Tracker}})
  - Missing unsubscribe links
  - Missing personalization merge tags
  - Missing plain-text version

Options:
  --format, -f    Output format: text (default) or json
  --help, -h      Show this help message

Examples:
  phishing-lint ./templates/welcome.html
  phishing-lint ./templates/*.html
  phishing-lint ./templates/ --format json
`.trim());
  process.exit(0);
}

interface FileResult {
  file: string;
  result: LintResult;
}

const results: FileResult[] = [];
let overallPassed = true;

for (const file of files) {
  const filePath = resolve(file);
  let html: string;

  try {
    html = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(`\n[ERROR] Cannot read file: ${filePath}`);
    overallPassed = false;
    continue;
  }

  const template: EmailTemplate = { html };
  const result = lint(template);

  results.push({ file, result });

  if (format === 'text') {
    console.log(`\n\u2500\u2500 ${file} \u2500\u2500`);

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
    files: results.map(({ file, result }) => ({
      file,
      passed: result.passed,
      errors: result.errors.length,
      warnings: result.warnings.length,
      suggestions: result.suggestions.length,
      violations: [...result.errors, ...result.warnings, ...result.suggestions],
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}

process.exit(overallPassed ? 0 : 1);
