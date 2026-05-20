---
title: "Lint Your Phishing Templates Like You Lint Your Code"
published: false
description: Red teams craft GoPhish templates, then half of them end up in spam because of missing tracking pixels, broken merge tags, or trigger words. This linter catches it all before you launch the campaign.
tags: security, javascript, opensource, devops
cover_image: <COVER_IMAGE_URL>
canonical_url: https://github.com/hailbytes/phishing-template-linter
published_at: 2026-05-23 13:00 +0000
---

<!--
COVER IMAGE PROMPT (1000x420, 2.4:1 banner):

Flat vector illustration, isometric perspective. A stylized email envelope in the center
with a thin fish-hook line dipping into it (subtle phishing motif, not aggressive). A
floating clipboard / checklist beside the envelope shows a column of checkmark and warning
icons (no readable text). A faint "spam folder" icon in the corner being crossed out with a
soft slash. Dark navy (#0a1628) background, electric cyan (#00d4ff) primary, amber
(#ffb347) for the hook and warnings, soft green (#5eead4) for checkmarks. Banner
composition, generous negative space. No text in the image.

Suggested generators: Midjourney v6+ with `--ar 1000:420 --style raw`, DALL-E 3, or Flux.
After generation, host on Cloudinary or GitHub raw and replace <COVER_IMAGE_URL> above.
-->

You spent two hours crafting a convincing IT helpdesk pretext. You ship the campaign. The click rate is 2%.

It's not because employees got more savvy. It's because half your emails landed in spam, your tracking pixel was broken so you never saw the opens, and your `{{.FirstName}}` was actually `{{.first_name}}` and rendered as a literal string in every recipient's inbox.

I built [`@hailbytes/phishing-template-linter`](https://www.npmjs.com/package/@hailbytes/phishing-template-linter) after the third campaign in a row where this happened.

## Lint a directory of templates

```bash
npx @hailbytes/phishing-template-linter ./templates/
```

You get a per-template report of:

- Broken or unknown merge tags
- Missing tracking pixel / link rewrite hooks
- Spam-trigger phrases (the obvious ones, but also Gmail's newer heuristics)
- Deliverability red flags (mismatched display names, suspicious from-domain handling, bare URLs in plaintext)
- Missing or malformed HTML/text alternatives

## Use it programmatically

```ts
import { lint } from '@hailbytes/phishing-template-linter';

const result = lint(templateHtml);

// Errors fail the campaign launch; warnings get reviewed by a human
if (result.errors.length > 0) process.exit(1);
```

## Wire it into CI

```bash
npx @hailbytes/phishing-template-linter ./templates/ --format=json > report.json
```

Drop that into your campaign-management pipeline and your phishing sims get the same pre-flight guardrails your production code already has.

It's GoPhish-format aware, so the merge-tag rules know about `{{.FirstName}}`, `{{.URL}}`, `{{.TrackingURL}}`, and the rest of the GoPhish template grammar.

```bash
npm install @hailbytes/phishing-template-linter
```

Source: [github.com/hailbytes/phishing-template-linter](https://github.com/hailbytes/phishing-template-linter) — MIT licensed. Built as a companion to the HailBytes SAT platform but works standalone with any GoPhish-format templates.
