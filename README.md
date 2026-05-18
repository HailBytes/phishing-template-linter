# @hailbytes/phishing-template-linter

> Lints GoPhish-format email templates for deliverability, tracking, merge tags, and spam triggers.

![Status: Incubation — not yet published to npm](https://img.shields.io/badge/Status-Incubation%20%E2%80%94%20not%20yet%20published%20to%20npm-yellow)

## Planned npm Package

```
npm install @hailbytes/phishing-template-linter
```

## Planned Audience

MSSPs, red teamers, and security-awareness trainers managing GoPhish campaign templates who want automated quality checks before deployment.

## Planned API Sketch

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
