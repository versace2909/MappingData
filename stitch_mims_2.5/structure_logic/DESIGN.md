# Design System Strategy: The Architectural Surface

## 1. Overview & Creative North Star
**Creative North Star: "The Precise Workspace"**

This design system rejects the "boxed-in" nature of traditional enterprise software. Instead of rigid containers and heavy lines, we utilize **Tonal Layering** and **Editorial Spacing** to create a sense of infinite, organized air. The aesthetic is professional and functional, yet feels premium through intentional asymmetry and a "Glass-on-Paper" philosophy. We move away from the "standard SaaS" look by prioritizing content through background shifts rather than structural borders, creating a workspace that feels like a high-end physical desktop.

## 2. Color & Tonal Depth
The palette is rooted in a sophisticated range of neutrals, accented by a commanding Indigo (`primary`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off the interface. 
- Boundaries must be defined solely through background shifts. 
- A `surface-container-low` section should sit atop a `surface` background to denote hierarchy. 
- This creates a seamless, fluid transition across the application that reduces cognitive load and visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Workspace:** `surface-container-low` (#f0f4f7)
- **Primary Focus (Cards/Modals):** `surface-container-lowest` (#ffffff)
- **Global Navigation/Sidebars:** `surface-container` (#e8eff3)

### The "Glass & Signature" Rule
To elevate the experience from "generic" to "bespoke," use **Glassmorphism** for floating elements (e.g., Command Palettes or Popovers). Apply a backdrop-blur (12px–20px) to `surface-container-lowest` with 80% opacity. 
- **Signature CTA:** For primary actions, use a subtle linear gradient: `primary` (#3755c3) to `primary_dim` (#2848b7) at a 135-degree angle. This adds "visual soul" and depth that a flat hex code cannot achieve.

## 3. Typography: The Editorial Scale
We pair the technical precision of **Inter** with the structural elegance of **Manrope**.

| Level | Token | Font | Size | Weight | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | 700 | Large hero metrics or intro statements. |
| **Headline** | `headline-md`| Manrope | 1.75rem | 600 | Page titles and primary section headers. |
| **Title** | `title-md` | Inter | 1.125rem | 500 | Card titles and modal headers. |
| **Body** | `body-md` | Inter | 0.875rem | 400 | Standard UI text and data entry. |
| **Label** | `label-sm` | Inter | 0.6875rem | 600 | Metadata and micro-labels (All Caps). |

**Inter** is utilized for functional, high-density data, while **Manrope** provides a "branded" editorial feel for high-level navigation and headers. Use `on-surface-variant` (#566166) for secondary body text to maintain a soft contrast ratio that reduces eye strain.

## 4. Elevation & Depth
Depth is achieved through **Tonal Stacking** rather than traditional drop shadows.

- **The Layering Principle:** To create "lift," place a `surface-container-lowest` card on a `surface-container-low` background. The subtle shift from #f0f4f7 to #ffffff provides a natural, soft elevation.
- **Ambient Shadows:** For floating elements only (Modals/Dropdowns), use a shadow with a 32px blur, 0px offset, and 6% opacity using the `on-surface` color. Never use pure black shadows.
- **The "Ghost Border":** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline-variant` (#a9b4b9) at **15% opacity**. It should be felt, not seen.

## 5. Specialized Enterprise Components

### Data Tables (The "Fluid Grid")
- **Eliminate Rows:** Remove horizontal and vertical lines.
- **Zebra Tones:** Use alternating rows of `surface` and `surface-container-low`.
- **Active State:** The selected row uses `primary-container` (#dde1ff) with an `on-primary-fixed` (#0732a3) text weight increase.

### Mapping Connectors & Nodes
- **Nodes:** Use `surface-container-lowest` with a `md` (0.375rem) corner radius.
- **Connectors:** Use `outline-variant` (#a9b4b9) with a 1.5px thickness. For active data flows, use a shimmering gradient from `primary` to `secondary`.

### Upload Zones
- **Surface:** `surface-container-low` with a dashed `outline` (#717c82) at 40% opacity.
- **Interaction:** On drag-over, transition the background to `primary-container` and the dashed line to `primary`.

### Buttons & Inputs
- **Primary Button:** Indigo gradient (see Section 2) with `lg` (0.5rem) roundedness.
- **Input Fields:** `surface-container-highest` (#d9e4ea) background, no border. On focus, a 2px "Ghost Border" of `primary` at 50% opacity.
- **Cards:** Forbid divider lines. Use 24px of vertical padding (from the spacing scale) to separate header from body content.

## 6. Do’s and Don’ts

### Do
- **Do** use `surface-dim` (#cfdce3) for empty states to provide a "recessed" feel.
- **Do** utilize `full` (9999px) roundedness for status chips to contrast with the `lg` roundedness of containers.
- **Do** prioritize white space over lines. If a layout feels cluttered, increase the gap, don't add a border.

### Don't
- **Don't** use `error` (#9f403d) for non-critical warnings. Reserve it for destructive actions to maintain its psychological weight.
- **Don't** use 100% black text. Always use `on-surface` (#2a3439) for better readability on digital screens.
- **Don't** stack more than three levels of surface containers (e.g., Surface > Container Low > Container Lowest). Any further depth should be handled via a modal or side-sheet.