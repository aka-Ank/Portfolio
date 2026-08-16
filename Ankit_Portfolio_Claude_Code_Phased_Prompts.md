# Ankit Chaudhary — Cinematic Biome Portfolio
## Claude Code Phased Prompt Set (Prompt Bible + Navigator/Footer Addendum merged)

**How to use this document:** Feed Claude Code one phase at a time. Read its research summary and recommendation before approving the implementation plan for that phase. Don't skip ahead — each phase depends on decisions made in the one before it.

---

## 0. Master System Prompt
Paste this once at the start of the project (or save as `CLAUDE.md` in the repo root).

```
You are helping build a premium portfolio for Ankit Chaudhary — a B.Tech Computer
Engineering student at Pandit Deendayal Energy University, with an internship at
Multitech Support & Development. This is not a generic portfolio. It is a cinematic,
biome-based world grounded entirely in his real resume.

Must follow on every phase:
1. Research before building. Compare at least two approaches and justify the choice.
2. Suggest improvements and stronger alternatives — don't just implement the first idea.
3. Build in phases. Do not jump ahead of the current phase's scope.
4. Keep motion smooth and deliberate — no messy scroll-based drift.
5. Use direct chapter switching between biomes, not gradual scroll reveal.
6. Split project content strictly into SDE and AIML tracks (see content map below).
7. Include a classic static mode (/classic) with normal scrolling — not a fallback,
   a deliberate alternate entrance to the same story.
8. Keep all content honest and grounded in the real resume. No invented achievements,
   no vague filler, no placeholder text pretending to be real work.
9. Make assets specific and concrete — never "use better nature assets," always name
   the asset type, its source, and where it belongs.
10. Keep the site fast, SEO-friendly, accessible, and polished (Lighthouse 95+ target).

Aesthetic direction: Studio Ghibli × Horizon Zero Dawn — soft painted nature, cinematic
forests, glowing rivers, elegant mechanical animals with subtle AI energy.

For every phase, report back:
- Research summary
- Recommendation (with reasoning)
- Implementation plan
- Improvement ideas
- Risks
- Next actions

If a design or technical choice is weak, replace it with a stronger one and explain why.
If a library choice is questionable, research alternatives and recommend the best fit.
```

---

## Reference Tables
Keep these visible/pinned — later phase prompts refer back to them.

**Content map (from the real resume):**

| Section | What to display |
|---|---|
| Header | Ankit Chaudhary, title, short one-line identity |
| About | Short narrative summary of the learning journey |
| Education | PDEU, B.Tech in Computer Engineering, CGPA, coursework |
| Internship | Multitech Support & Development, ML intern, core work |
| SDE Projects | Hamro Vanshavali, Smart Hostel Management System |
| AIML Projects | AML Detection, Flood Prediction (STGCN), Smart Traffic Management (PySpark), House Price Prediction (TensorFlow) |
| Skills | Python, Java, C++, JavaScript, SQL, React, Node, PyTorch, TensorFlow, XGBoost, etc. |
| Links | GitHub, LinkedIn, resume PDF, contact |

**Biome map:**

| Biome | Role |
|---|---|
| Entrance Meadow | First impression, title, tagline, invitation to begin |
| Moss River Valley | About, education, internship, learning story |
| Ancient Grove | SDE projects — Hamro Vanshavali, Smart Hostel Management System |
| Mechanical Jungle | AIML projects — AML Detection, Flood Prediction, Smart Traffic, House Price Prediction |
| Moonlit Observatory | GitHub activity, LeetCode stats, certifications, blogs |
| Campfire Terminal | Contact, resume, social links, final CTA |

**Motion rules:** direct chapter switching on scroll (no drift) · soft cinematic transitions (fade / fog wipe / light sweep / dissolve) · inertia + damping camera · minimal stable UI · asynchronous ambient particles · smooth morning→afternoon→evening→night shift.

**Feature restraint table:** dark/light mode (smooth shift, not abrupt) · ambient sound (optional, mute control) · voice assistant (natural commands) · AI chatbot (resume-aware, can navigate) · GitHub activity (quiet, live) · LeetCode stats (compact) · blog archive (not a feed) · certifications (timeline/constellation) · skill tree (animated, elegant) · keyboard shortcuts (visible hints) · easter eggs (hidden cave, Konami code). Every feature needs a fallback.

**Asset bible:** backgrounds (painted forests/hills/rivers/mist/sky gradients), creatures (deer/owls/foxes/birds with mechanical/luminous details), props (lanterns, ancient stones, roots, crystals, bridges, flowers), effects (fog, light rays, dust motes, ripples, fireflies), UI (minimal icons, thin separators). Sources to compare: Haikei, Motion.dev/Framer Motion/GSAP, React Three Fiber/Three.js examples, Poly Haven, LottieFiles, SVG Repo, Blender/custom illustration.

**SEO / Performance / Accessibility minimums:**

| Area | Standard |
|---|---|
| SEO | Semantic HTML, metadata, Open Graph, canonical URLs, sitemap, robots.txt, JSON-LD |
| Accessibility | Keyboard navigation, focus states, alt text, reduced-motion support, readable contrast |
| Performance | Code splitting, lazy loading, optimized assets, caching, compression, minimal layout shift |
| Fallbacks | Classic mode, low-power mode |

**Final quality gate** (run after every phase, not just Phase 8):
- Would a recruiter remember this after closing the tab?
- Do the transitions feel smooth and controlled?
- Does the world feel like a world, not a stack of sections?
- Does classic mode still look excellent on its own?
- Are the assets specific enough to avoid vague junk?
- Is the site still fast and usable?

If any answer is no: revise, simplify, or research a better path before moving on.

---

## Phase 1 — Research, Comparisons, Architecture Proposal, Asset Strategy

```
Phase 1 of the Ankit Chaudhary portfolio build.

Research and propose the technical architecture for a cinematic, biome-based portfolio
with an immersive 3D mode and a classic static mode. Compare at least two viable stacks
(e.g. Next.js + React Three Fiber + GSAP vs. alternatives) and recommend one, with reasoning.

Also propose the asset strategy: for each asset category in the asset bible (backgrounds,
creatures, props, effects, UI), name the specific source you'd use and why, rather than
generic placeholders.

Do not write implementation code yet. Report: research summary, recommendation,
implementation plan for Phase 2 onward, improvement ideas, risks, next actions.
```

---

## Phase 2 — World Map, Route Map, Design System, File Structure, Content Map

```
Phase 2 of the Ankit Chaudhary portfolio build.

Using the architecture chosen in Phase 1, propose:
- The full world map (biome order and transitions) based on the biome table.
- The route map (immersive root + /classic route + any deep links to specific biomes/projects).
- A design system (type scale, color tokens for day/night shift, spacing, motion tokens).
- The file/folder structure for the codebase.
- The content map, populated with the real resume data from the content map table —
  no placeholder or invented content.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 3 — Motion Engine, Chapter Switching, Time-of-Day Sync, Camera System
### *(includes the floating side navigator — addendum merged in)*

```
Phase 3 of the Ankit Chaudhary portfolio build.

Research and build the motion engine: direct chapter (biome) switching on scroll/
navigation input, camera inertia and damping, and the smooth morning → afternoon →
evening → night time-of-day shift. No scroll-drift or parallax overload — one gesture
moves to the next or previous chapter directly, with a soft cinematic transition
(compare fade, fog wipe, light sweep, and dissolve, then pick one and justify it).

As part of this same system, add the floating side navigator:
- Hidden by default. Appears when the user starts scrolling, moving, or navigating
  between chapters; fades out after a short idle delay.
- Fixed to one side of the viewport (right side on desktop by default).
- Style: minimal glass panel or narrow pill rail — never bulky, never blocking the
  artwork or story.
- Content: current biome name, compact chapter list, progress through the world,
  quick-jump markers.
- Remains reachable by hover or keyboard focus even while faded.
- On mobile: compress into a small floating button or bottom sheet.
- Smooth fade-in/fade-out, no layout shift, keyboard accessible, clean active state
  for the current chapter.

Research the best UI pattern for this navigator before implementing: compare a
right-rail, a bottom-pill, and a minimal compass design, then choose the strongest
one and explain why it fits the Ghibli-meets-mechanical-forest mood.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 4 — Biome Creation and Atmospheric Styling
### *(includes navigator biome-awareness — addendum merged in)*

```
Phase 4 of the Ankit Chaudhary portfolio build.

Build out each biome from the biome map with its own atmospheric styling — visually
distinct but clearly part of the same world (consistent light language, particle
system, and palette shifts per biome). Each biome should reset cleanly as the next
takes over; no half-rendered or awkwardly stacked content.

Wire the floating navigator (from Phase 3) into this biome system: it must correctly
reflect and highlight the current biome as the user moves through Entrance Meadow,
Moss River Valley, Ancient Grove, Mechanical Jungle, Moonlit Observatory, and
Campfire Terminal — updating its active state and progress indicator in sync with
the chapter transitions, with no lag or flicker between biome change and navigator
update.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 5 — SDE Section and AIML Section (Project Deep Dives)

```
Phase 5 of the Ankit Chaudhary portfolio build.

Build the Ancient Grove (SDE track: Hamro Vanshavali, Smart Hostel Management
System) and Mechanical Jungle (AIML track: AML Detection, Flood Prediction using
STGCN, Smart Traffic Management using PySpark, House Price Prediction using
TensorFlow) biomes as full project deep-dives, grounded strictly in the real resume
content — no invented metrics or features.

Make the SDE vs. AIML split visually and narratively obvious, so a visitor
immediately understands Ankit is both a software builder and an AI/ML builder.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 6 — Chatbot, Voice, GitHub, LeetCode, Blog, Shortcuts, Easter Eggs

```
Phase 6 of the Ankit Chaudhary portfolio build.

Implement the Moonlit Observatory (GitHub activity, LeetCode stats, certifications,
blog archive) and the supporting utility features from the feature restraint table:
resume-aware AI chatbot (can also navigate the site), optional voice assistant
("show SDE projects", "open AIML biome"), visible keyboard shortcut guide, and
tasteful easter eggs (hidden cave, Konami code).

Every feature must degrade gracefully: if audio/voice/3D is unavailable, the site
must still be fully navigable and readable.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 7 — Classic Mode and Route Switching
### *(includes the footer command strip — addendum merged in)*

```
Phase 7 of the Ankit Chaudhary portfolio build.

Build the /classic route: a separate, normal-scrolling, semantic-HTML portfolio page
with minimal JS and polished typography. It must have full content parity with the
immersive mode (same projects, same resume facts, same contact info) and must feel
like a deliberate alternate entrance to the same story — not a stripped-down
fallback. Provide a visible, easy toggle between immersive and classic modes.

As part of this phase, build the footer as a persistent settings control panel,
available in both immersive and classic modes:
- Theme toggle (smooth dark/light shift, optionally time-synced with the biome's
  time-of-day).
- Audio toggle (ambient sound + SFX mute).
- Motion toggle (reduced motion vs. full motion).
- Experience switch (immersive ↔ classic mode — do not bury this in a menu).
- Help/shortcuts control (opens the keyboard shortcut guide from Phase 6).

Layout: left side for brand/copyright, center for mode + audio controls, right side
for help/shortcuts. Keep it small, elegant, and readable — a calm command strip, not
a noisy settings bar. On mobile, stack controls neatly without losing clarity.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## Phase 8 — Optimization, Testing, Accessibility, SEO, Polish

```
Phase 8 of the Ankit Chaudhary portfolio build.

Bring the site to production quality against the SEO/Performance/Accessibility
minimums table: semantic HTML + metadata + Open Graph + sitemap + JSON-LD, full
keyboard navigation + focus states + alt text + reduced-motion support, code
splitting + lazy loading + optimized/compressed assets + minimal layout shift.
Target Lighthouse 95+ in a realistic production build. Confirm content remains
available even if WebGL fails.

Then run the final quality gate from the reference tables against the finished
site and report the result honestly — if anything fails, propose the fix before
calling the project done.

Report: research summary, recommendation, implementation plan, improvement ideas,
risks, next actions.
```

---

## After Phase 8
Run the **Final quality gate** (see Reference Tables above) once more against the live, deployed site. Do not consider the project finished until every item passes.
