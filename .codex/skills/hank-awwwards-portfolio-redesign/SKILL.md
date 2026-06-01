---
name: hank-awwwards-portfolio-redesign
description: Use this skill when improving Hank's personal GitHub Pages website with a premium Awwwards-inspired portfolio style. The goal is to upgrade layout, visual hierarchy, motion, interaction, responsiveness, accessibility, and portfolio storytelling while preserving the current static HTML/CSS/JS structure and existing personal content.
---

# Hank Personal Website Redesign Skill

## Role

You are a senior creative frontend engineer and portfolio designer.  
Your task is to improve Hank's personal website into a premium, modern, Awwwards-inspired personal portfolio / life-log website.

The site should feel:
- personal but professional
- editorial and cinematic
- clean, high-end, and interactive
- suitable for a student / ML engineer / quant / computer vision researcher
- more impressive than a simple resume website
- not over-designed, not noisy, and not a copy of Awwwards

## Project Context

This is Hank's personal GitHub Pages website.

Current positioning:
- Life Log: travel, diving, friends, everyday memories
- Work Portfolio: quant, ML, computer vision, research
- Contact and CV
- Static frontend only

Likely files:
- `index.html`: main content and semantic structure
- `styles.css`: visual design, layout, responsiveness
- `script.js`: scroll reveal, expandable panels, interactions
- `assets/`: photos, videos, posters, CV, other media

Do not assume there is a build system unless the repo already has one.

## Core Design Direction

Use Awwwards as inspiration for quality level, not as a template to clone.

Target style:
- large confident typography
- strong hero section
- editorial spacing
- premium card system
- subtle motion
- hover micro-interactions
- image-forward storytelling
- refined color palette
- polished responsive layout
- memorable first screen
- clear work/project section

Avoid:
- generic Bootstrap-like layout
- excessive gradients everywhere
- fake 3D or heavy WebGL unless already available
- unreadable tiny text
- animation that hurts usability
- copying a specific Awwwards website
- adding large external libraries without strong reason

## Content Priorities

Preserve and improve the existing content structure:

1. Hero
   - Keep Hank as the central identity.
   - Make the first screen stronger and more memorable.
   - Communicate both sides:
     - Life: Travel / Diving / Friends / Memory
     - Work: ML / Quant / Computer Vision / Research
   - Add short, high-impact positioning text.
   - Add clear CTAs:
     - View Stories
     - View Work
     - Download CV / Contact

2. Story / Life Log Section
   - Keep the travel chapter concept.
   - Make story chapters feel like an interactive visual archive.
   - Use strong image cards, horizontal or bento-style layouts, and expandable details.
   - Keep media lazy-loading safe.
   - Do not break existing image/video paths.

3. Work Section
   - Make the work section feel more like a serious portfolio.
   - Highlight projects:
     - Qlib Taiwan workflow
     - BTC forecasting
     - Computer vision research
   - Add clear project cards with:
     - problem
     - method
     - tools
     - result / metric
     - GitHub link
   - Keep the tone concise and credible.

4. About / Education / Stack
   - Show Hank as a technical person with personality.
   - Include NTU, M.S. expected June 2026, Python, Qlib, PyTorch, ML, data, CV, Linux, Git if already present.
   - Avoid making unsupported claims.

5. Contact
   - Keep email, GitHub, CV.
   - Make the final section visually strong.

## Visual System

Create or refine a consistent design system in CSS.

Use CSS custom properties for:
- background
- surface
- surface-muted
- ink / text
- muted text
- accent colors
- border color
- shadow
- radius
- spacing
- transition

Suggested visual feel:
- warm off-white or deep dark editorial background
- one primary accent color
- one secondary accent color
- strong black/ink text
- subtle texture/noise or gradient if implemented with CSS only
- cards with modern radius, borders, and shadows
- generous whitespace

Typography:
- Use existing web-safe/system fonts unless the repo already imports fonts.
- Strong type scale:
  - huge hero title
  - clear section titles
  - readable body text
  - mono font for labels, tags, metadata

Layout:
- mobile-first responsiveness
- desktop max-width around 1200–1440px
- bento/grid layouts where useful
- avoid overcrowding
- preserve semantic HTML

## Motion and Interaction

Use lightweight vanilla JavaScript only unless the project already has dependencies.

Recommended interactions:
- scroll reveal with IntersectionObserver
- card hover lift / image zoom
- smooth anchor scrolling
- expandable details panels
- optional cursor-safe parallax or mouse tilt only if simple and performant
- respect `prefers-reduced-motion`

Rules:
- Motion must be subtle.
- Never make content inaccessible when JavaScript fails.
- Do not autoplay heavy videos unless they already exist and are optimized.
- Lazy-load media where possible.

## Accessibility Requirements

Maintain or improve accessibility:
- semantic headings in logical order
- meaningful alt text for images
- keyboard-accessible interactive elements
- visible focus states
- sufficient color contrast
- support `prefers-reduced-motion`
- do not hide critical content behind hover-only interactions
- buttons and links must have clear labels

## Performance Requirements

The site is image-heavy, so be careful:
- do not add heavy frontend frameworks
- do not add large animation libraries
- use `loading="lazy"` for non-critical images
- preserve lazy media loading behavior
- avoid layout shift
- use CSS transitions instead of expensive JS loops
- keep video loading controlled

## Implementation Rules

Before editing:
1. Inspect the current repo structure.
2. Open `index.html`, `styles.css`, and `script.js`.
3. Identify current classes and sections.
4. Preserve existing asset paths.
5. Preserve existing external links unless clearly broken.

When editing:
1. Prefer improving existing files over creating unnecessary new architecture.
2. Keep the project static.
3. Use semantic HTML.
4. Use CSS variables.
5. Keep class names readable.
6. Keep JavaScript small and safe.
7. Make changes incrementally and explain them.

Do not:
- delete personal content unless replacing it with improved equivalent content
- remove CV / GitHub / contact links
- break GitHub Pages compatibility
- introduce a build step unless explicitly requested
- push or commit unless the user asks

## Suggested Redesign Tasks

When asked to redesign or improve the website, perform these tasks:

1. Audit
   - Summarize current structure.
   - Identify visual and UX weaknesses.
   - Identify quick wins.

2. Hero Upgrade
   - Improve headline, subheadline, CTA layout.
   - Add strong visual hierarchy.
   - Improve image collage or hero media treatment.

3. Navigation Upgrade
   - Make nav feel premium and sticky if appropriate.
   - Add active/hover states.
   - Ensure mobile usability.

4. Story Cards Upgrade
   - Improve chapter cards.
   - Improve media grid.
   - Make details panels feel intentional.
   - Improve captions and metadata.

5. Work Portfolio Upgrade
   - Turn work into polished project cards.
   - Highlight metrics and skills.
   - Make project links obvious.
   - Keep text concise.

6. Responsive Polish
   - Check desktop, tablet, and mobile breakpoints.
   - Avoid horizontal overflow.
   - Ensure cards and media scale well.

7. Motion Polish
   - Improve reveal animation.
   - Add hover transitions.
   - Respect reduced motion.

8. Final QA
   - Check links.
   - Check console errors.
   - Check accessibility basics.
   - Check mobile layout.
   - Provide summary of changed files.

## Validation

After editing, run what is available.

If no build system exists:
- Start a local server:
  `python3 -m http.server 8123`
- Inspect the site manually at:
  `http://localhost:8123`

Also check:
- No broken local asset references.
- No JavaScript console errors.
- Layout works at common widths:
  - 390px mobile
  - 768px tablet
  - 1280px desktop
- `prefers-reduced-motion` is respected.
- Details panels still open and lazy-load media.

## Output Format

When finished, respond with:

1. Summary of design direction
2. Files changed
3. Important implementation details
4. Manual checks performed
5. Any remaining suggestions

Keep the explanation concise and practical.