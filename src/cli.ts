#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { lint } from './lint.js';
import type { EmailTemplate } from './types.js';

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: phishing-lint <file.html> [file2.html ...]

Lints GoPhish-compatible HTML email templates for:
  - High-risk spam trigger phrases
  - Missing tracking pixels ({{.Tracker}})
  - Missing unsubscribe links
  - Missing personalization merge tags
  - Missing plain-text version

Examples:
  phishing-lint ./templates/welcome.html
  phishing-lint ./templates/*.html
`.trim());
  process.exit(0);
}

let overallPassed = true;

for (const arg of args) {
  const filePath = resolve(arg);
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

  console.log(`\n\u2500\u2500 ${arg} \u2500\u2500`);

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

  if (!result.passed) overallPassed = false;
}

process.exit(overallPassed ? 0 : 1);
