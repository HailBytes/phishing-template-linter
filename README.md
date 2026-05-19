# @hailbytes/phishing-template-linter

> Lints GoPhish-format email templates for deliverability, tracking, merge tags, and spam triggers. Companion to HailBytes SAT.

[![npm version](https://img.shields.io/npm/v/%40hailbytes%2Fphishing-template-linter.svg)](https://www.npmjs.com/package/%40hailbytes%2Fphishing-template-linter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40hailbytes%2Fphishing-template-linter)](https://bundlephobia.com/package/@hailbytes/phishing-template-linter)

---

## What it does

Automatically lint GoPhish-format email templates before deployment. Catches deliverability issues, missing tracking pixels, broken merge tags, and spam trigger words — so your simulated phishing campaigns actually land in inboxes.

---

## Install

```bash
npm install @hailbytes/phishing-template-linter
# or run directly
npx @hailbytes/phishing-template-linter ./templates/
```

---

## Quick Start

### CLI
```bash
# Lint all templates in a directory
npx @hailbytes/phishing-template-linter ./templates/

# Lint a single template file
npx @hailbytes/phishing-template-linter ./templates/it-helpdesk.html

# Output as JSON for CI integration
npx @hailbytes/phishing-template-linter ./templates/ --format json
```

### Programmatic
```ts
import { lint } from '@hailbytes/phishing-template-linter';

const result = lint(templateHtml);

console.log(result.errors);      // RuleViolation[] — must-fix issues
console.log(result.warnings);    // RuleViolation[] — should-fix issues
console.log(result.suggestions); // RuleViolation[] — nice-to-have improvements

// Exit non-zero in CI if any errors
if (result.errors.length > 0) process.exit(1);
```

---

## Who Is This For

MSSPs, red teamers, and security-awareness trainers managing GoPhish campaign templates who want automated quality checks before deployment.

---

## See Also

- [`@hailbytes/asm-scope-parser`](https://github.com/HailBytes/asm-scope-parser) — Attack surface scope parsing
- [HailBytes SAT Platform](https://hailbytes.com/sat)

---

*Part of the [HailBytes](https://hailbytes.com) open-source security toolkit.*
