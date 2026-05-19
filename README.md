# @hailbytes/phishing-template-linter

> Lints GoPhish-format email templates for deliverability, tracking, merge tags, and spam triggers.

[![npm version](https://img.shields.io/npm/v/%40hailbytes%2Fphishing-template-linter.svg)](https://www.npmjs.com/package/%40hailbytes%2Fphishing-template-linter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Install

```bash
npm install @hailbytes/phishing-template-linter
```

## Who Is This For

MSSPs, red teamers, and security-awareness trainers managing GoPhish campaign templates who want automated quality checks before deployment.

## API

### CLI
```bash
npx @hailbytes/phishing-template-linter ./templates/
```

### Programmatic
```ts
import { lint } from '@hailbytes/phishing-template-linter';

const result = lint(template);
// { errors: RuleViolation[], warnings: RuleViolation[], suggestions: RuleViolation[] }
```

## See Also

- [@hailbytes/asm-scope-parser](https://github.com/HailBytes/asm-scope-parser)
- [HailBytes SAT Platform](https://hailbytes.com)

## Links

- [hailbytes.com](https://hailbytes.com)
