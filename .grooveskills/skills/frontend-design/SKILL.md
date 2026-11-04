---
name: frontend-design
description: Distinctive, opinionated visual design guidance for building new UI or reshaping existing interfaces. Steers away from generic AI clichés (purple gradients, uniform rounded cards, default Inter typography) toward bespoke tokens, intentional typography, layout wireframing, and disciplined restraint. TRIGGER when designing components, pages, landing screens, web apps, or creating visual design systems.
---

# Frontend Visual Design & Identity

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is never mistaken for anyone else's. The client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

---

## 1. Ground Your Designs in the Subject Matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can propose one concrete subject, the design's audience, and the design's primary job.

The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a children's toy will be aesthetically distinct from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

---

## 2. Core Design Principles

1. **Hero Character**:
   - The hero is the first thing viewers see. Open with the most characteristic element in the subject's world: a headline, an image, an animation, a live interactive moment, or another treatment.
   - A big number with a small label, supporting stats, and a gradient accent is the generic default: only use it if it is genuinely the best option.

2. **Typography as Personality**:
   - Use one family or two; if two, make them clearly distinct.
   - Choose typefaces deliberately, not default system fonts. Set a clear type scale following *The Elements of Typographic Style* with intentional weights, widths, and spacing.
   - Use the type treatment as an active visual element, not a neutral delivery vehicle.
   - Default to line lengths under 80 characters. Serif typefaces can have slightly longer line lengths with increased line-height.

3. **Avoid Default Typographic Tells**:
   - Accenting just a single word or phrase in a headline (e.g. putting one word in italic/bold or a different color).
   - Using all caps for generic labels.
   - Adding unnecessary typographic labels or eyebrows above content.

4. **Visual Structure is Information**:
   - Outlines, borders, numbering, and dividers encode useful information rather than decorate.
   - Avoid numbered markers (`01 / 02 / 03`) unless the content represents an actual sequence or timeline.

5. **Disciplined Motion**:
   - Use non-user-triggered motion sparingly and deliberately, only to draw attention.
   - A single orchestrated reveal sequence lands better than scattered effects. Fade-and-slide-up entrances on each section and hover transitions on every card read as AI-generated.
   - Responsive motion that answers user actions (opening, expanding, confirming) is welcome.

---

## 3. Clichés to Actively Avoid ("AI Slop Tells")

AI-generated designs cluster around predictable defaults:
1. **Warm cream background** (near `#F4F1EA`) with high-contrast serif display and terracotta/warm-clay accent (near `#D97757`).
2. **Near-black background** (`#0B0B0B`) with a single bright acid-green or vermilion accent.
3. **Broadsheet-style layout** with hairline rules, zero border-radius, and dense newspaper columns.
4. **SaaS-card kit**: Content chopped into identical rounded cards, uniform border-radius on everything, identical soft grey shadows (`rgba(0,0,0,.1)`), and gradient washes.
5. **Template chrome**: Tracked-out ALL-CAPS eyebrow labels, meta strings joined with middle dots (`A · B · C`), labels with spaced em dashes (`WORD — fragment`), and `→` appended to buttons.

Where the brief specifies a direction, follow it. Where it leaves an axis free, do not spend that freedom on these defaults.

---

## 4. Two-Pass Workflow: Plan Before Writing Code

### Pass 1: Compact Token System & Layout Plan
Before touching HTML, CSS, or React, define:
- **Palette**: 4–6 named hex values tailored to the subject.
- **Type**: Selected typefaces and their specific hierarchy roles.
- **Layout**: Layout concept with one-sentence prose and ASCII wireframes to ideate alignment (left, center, asymmetrical).
- **Principles**: What makes this specific page visually unique.

### Pass 2: Review & Build
- Review the plan: if any part reads like a generic default produced for any similar page, revise it before writing code.
- Write clean CSS / Tailwind classes without conflicting selector specificities.

---

## 5. Restraint and Self-Critique

- **Spend boldness in one place**: Let one element be the memorable anchor; keep surrounding elements quiet and disciplined.
- **Quality floor**: Mobile responsiveness, visible keyboard focus, reduced motion respected (`prefers-reduced-motion`), and accessible contrast ratios.
- Critique your work during construction: before finishing, remove one unnecessary decorative accessory.

---

## 6. Sibling Skills

- **`ux-writing`**: Persuasive, empathetic microcopy and actionable CTA rules.
- **`react-core`**: Modern React component composition without anti-patterns.
- **`react-create-page`**: Declarative page coordinators, domain hooks, and atomic layout co-location.
