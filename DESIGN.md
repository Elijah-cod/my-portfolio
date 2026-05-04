---
name: Elijah Mathai Portfolio
description: A cinematic engineering portfolio for hiring audiences, blending system depth with polished visual restraint.
colors:
  base-night: "#07111f"
  base-night-deep: "#0a1526"
  surface-frost: "#0a1628b8"
  surface-panel: "#0d1b31e0"
  surface-panel-strong: "#10203af5"
  line-soft: "#9fb4d62e"
  line-strong: "#9fb4d64d"
  text-high: "#ecf4ff"
  text-muted: "#a8b7d3"
  accent-mint: "#72e2c2"
  accent-citron: "#a5ff8c"
  accent-coral: "#ff9b71"
  code-night: "#030a14e0"
typography:
  display:
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
    fontSize: "clamp(2.3rem, 4.3vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
    fontSize: "clamp(1.9rem, 2.45vw, 2.95rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  title:
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif'
    fontSize: "1.18rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.72
  label:
    fontFamily: '"SFMono-Regular", "JetBrains Mono", "Fira Code", Consolas, monospace'
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  sm: "14px"
  md: "20px"
  lg: "28px"
  pill: "999px"
spacing:
  xs: "10px"
  sm: "14px"
  md: "18px"
  lg: "22px"
  xl: "26px"
  panel: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent-mint}"
    textColor: "{colors.base-night}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "50px"
  button-secondary:
    backgroundColor: "{colors.surface-frost}"
    textColor: "{colors.text-high}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "50px"
  chip:
    backgroundColor: "{colors.surface-frost}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: "8px 10px"
  card-panel:
    backgroundColor: "{colors.surface-frost}"
    textColor: "{colors.text-high}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  field-input:
    backgroundColor: "{colors.code-night}"
    textColor: "{colors.text-high}"
    rounded: "16px"
    padding: "16px 18px"
---

# Design System: Elijah Mathai Portfolio

## 1. Overview

**Creative North Star: "The Quiet Engine"**

This system treats Elijah's portfolio like a composed machine room: calm on first contact, exact under inspection, and quietly powerful throughout. The visual language is not trying to impress through noise. It earns attention through discipline, atmosphere, and the feeling that every surface was engineered with intent.

The site should feel seamless, intelligent, and polished in the literal sense of the words. Navigation, section reveals, buttons, code samples, and architecture motifs all work together to suggest depth without clutter. The current dark palette, serif display voice, mono technical labels, and translucent panels already support that story, so future work should sharpen those choices rather than replace them with trendier ones.

This system explicitly rejects anything generic or template-shaped. Avoid stock developer-portfolio tropes, interchangeable SaaS dark-mode styling, hype-heavy AI visuals with little substance, and gimmicks that feel louder than the work itself. The goal is awe first, then curiosity, then trust.

**Key Characteristics:**
- Cinematic but restrained
- Technical without costume
- Editorial in pacing, not in aesthetic lane
- Precise in spacing, type, and interaction
- Built to turn admiration into conversation

## 2. Colors

The palette is a cool-night composition with two controlled accents: mint for intelligence and activation, coral for warmth and emphasis.

### Primary
- **Signal Mint** (`#72e2c2`): The main accent for active links, technical highlights, chips, focus outlines, and the luminous side of gradient buttons.

### Secondary
- **Citron Lift** (`#a5ff8c`): A brighter companion to the primary accent, used to give the main call-to-action gradient lift and to brighten hero metrics.

### Tertiary
- **Warm Relay** (`#ff9b71`): The warm counterweight used for metadata, section micro-labels, and moments that need human warmth against the colder system palette.

### Neutral
- **Base Night** (`#07111f`): The core page background, used in large uninterrupted fields.
- **Deep Night** (`#0a1526`): The upper gradient stop that gives the page its cinematic night-sky transition.
- **Frost Surface** (`#0a1628b8`): The main translucent panel fill for cards, shells, and restrained glass-like surfaces.
- **Panel Core** (`#0d1b31e0`): A denser elevated surface for stronger containment moments.
- **Panel Core Strong** (`#10203af5`): The firmest dark panel, reserved for places that need more visual weight.
- **High Text** (`#ecf4ff`): Primary reading color for headlines, actions, and key interface text.
- **Muted Text** (`#a8b7d3`): Supporting paragraph copy, captions, and secondary navigation.
- **Soft Line** (`#9fb4d62e`): Default stroke color for borders, dividers, and component framing.
- **Strong Line** (`#9fb4d64d`): Higher-confidence borders for architecture frames and modal shells.
- **Code Night** (`#030a14e0`): The darkest utility surface, used behind code samples and fields.

### Named Rules
**The Quiet Voltage Rule.** Mint is the lead voice. Citron exists to sharpen mint, not compete with it. Coral is used sparingly to humanize the system and should never take over a full screen.

**The Frosted Depth Rule.** Depth comes from tinted layering and transparency over dark fields, not from bright cards dropped onto a dark background.

## 3. Typography

**Display Font:** Iowan Old Style, with Palatino-based serif fallbacks  
**Body Font:** Avenir Next, with Segoe UI fallback  
**Label/Mono Font:** SFMono-Regular, with JetBrains Mono, Fira Code, and Consolas fallbacks

**Character:** The type system balances literary intelligence with product clarity. The serif display face gives authority and polish, while the sans and mono layers keep the interface readable, contemporary, and technically credible.

### Hierarchy
- **Display** (600, `clamp(2.3rem, 4.3vw, 4rem)`, 1.02): Reserved for hero statements and the highest-value sectional headlines.
- **Headline** (600, `clamp(1.9rem, 2.45vw, 2.95rem)`, 1.06): Used for section titles and major narrative pivots.
- **Title** (600, `1.18rem`, 1.4): Used on cards, project names, and smaller internal headings.
- **Body** (400, `1rem`, 1.72): Primary reading copy, with long-form blocks kept near a 68ch maximum to preserve calm density.
- **Label** (500, `0.82rem`, 1.4, `0.12em` tracking): Mono labels, chips, metadata, and system-like supporting information. Uppercase is appropriate here, but never for body copy.

### Named Rules
**The Three Voices Rule.** Serif leads narrative, sans carries reading, mono annotates the system. Do not swap their jobs casually.

**The Calm Contrast Rule.** Hierarchy comes from clear scale and role changes, not from piling on decorative styles.

## 4. Elevation

This system uses a hybrid depth model: tonal layering does most of the work, with one large ambient shadow vocabulary reinforcing containment. Panels feel suspended in dark air rather than stacked like app cards. Transparency, border tint, and occasional backdrop blur are part of the depth language.

### Shadow Vocabulary
- **Ambient Shell** (`0 24px 80px rgba(0, 0, 0, 0.28)`): The default containment shadow for major panels, hero surfaces, the sticky header, and modal-like elements.

### Named Rules
**The Contained Glow Rule.** Use the ambient shadow only on meaningful containers. Depth should feel architectural, not decorative.

**The Blur With Purpose Rule.** Backdrop blur is acceptable when it helps a sticky or overlay surface separate from the page, but it should never become generic glassmorphism.

## 5. Components

Each component should feel refined and restrained: confident enough to guide action, quiet enough to keep attention on Elijah's work and story.

### Buttons
- **Shape:** Pill silhouettes (`999px`) with a 50px minimum height and centered label alignment.
- **Primary:** A mint-to-citron gradient over dark text, with confident weight and no extra ornament.
- **Hover / Focus:** Subtle upward lift (`translateY(-2px)`) and crisp state changes. Focus uses a mint outline rather than a glow.
- **Secondary / Ghost / Tertiary:** Dark translucent fills with fine borders. Secondary actions stay visibly present without competing with the primary call to action.

### Chips
- **Style:** Small rounded pills with translucent mint tint or neutral frosted fill, depending on whether the chip is metadata or a technical tag.
- **State:** Use mint-tinted chips for system emphasis, neutral chips for taxonomy and supporting labels.

### Cards / Containers
- **Corner Style:** Large rounded corners, usually `28px`, with smaller internal containers stepping down to `20px` or `14px`.
- **Background:** Frosted dark surfaces with thin tinted borders, occasionally supported by soft radial highlights.
- **Shadow Strategy:** One diffuse ambient shadow for major surfaces, with tonal layering carrying the rest.
- **Border:** Fine translucent strokes, usually `1px`, often cooler than the fill beneath.
- **Internal Padding:** Most substantial cards sit in the `26px` to `28px` range, with tighter inner utilities around `18px`.

### Inputs / Fields
- **Style:** Dense dark fields with `16px` radius, thin cool borders, and clear text contrast.
- **Focus:** A mint outline with offset. Focus should read as exact and technical, not soft or glowy.
- **Error / Disabled:** Not yet fully defined in code. Future variants should stay tonal and precise rather than adding loud warning fills by default.

### Navigation
- **Style:** A sticky frosted capsule shell with restrained spacing and muted default link color.
- **Default / Hover / Active:** Links stay understated until hover, where a mint underline animates in. The interaction should feel surgical rather than playful.
- **Mobile Treatment:** The shell relaxes into a wrapped block layout below tablet width while preserving the same tone and spacing discipline.

### Signature Component
- **Architecture Frames:** System diagrams and node clusters are a signature pattern. They use mono labels, line-based connectors, dark node fills, and occasional mint emphasis to visualize backend depth without becoming infographic clutter.

## 6. Do's and Don'ts

### Do:
- **Do** preserve the current cool-night palette and let mint remain the primary activation color.
- **Do** keep major surfaces dark, translucent, and tinted rather than replacing them with flat opaque cards.
- **Do** use the serif display, sans body, and mono label split consistently so the portfolio keeps its authored voice.
- **Do** maintain generous line-height and readable paragraph widths so the dense technical story still feels calm.
- **Do** make motion brief and directional, with hover lifts around `2px` and reveal transitions around `500ms`.
- **Do** keep borders thin, usually `1px`, and rely on tonal contrast before adding more decoration.

### Don't:
- **Don't** make this generic or template-shaped.
- **Don't** fall back to stock developer-portfolio tropes.
- **Don't** drift into interchangeable SaaS dark-mode styling.
- **Don't** use hype-heavy AI visuals with little substance.
- **Don't** add gimmicks that feel louder than the work itself.
- **Don't** make the site feel mass-produced, derivative, or like it is borrowing someone else's identity.
- **Don't** turn backdrop blur into decorative glassmorphism.
- **Don't** replace the restrained component language with oversized gradients, side-stripe accents, or loud card-grid repetition.
