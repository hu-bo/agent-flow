# CLAUDE.md

## Project Overview

agent-flow — AI Agent 编排平台，支持对话式任务执行、DAG + Loop 工作流、多 Agent 团队协作、统一模型接入与长对话自动压缩。



## Tech Stack

- **Language**: TypeScript 5.8 (strict mode), Go 1.23 (api-gateway)
- **Monorepo**: pnpm 10.32.1 + Turborepo
- **Runtime**: Node.js (ES2022 target, CommonJS modules)
- **Testing**: Vitest 3.2.1 (globals enabled)
- **Backend**: Express 5, WebSocket (ws)
- **Frontend**: React 19, Vite 7
- **Model SDK**: Vercel AI SDK (primary adapter)

### FRONT-END TECH STACK:
  - Core: React 19 + TypeScript + Vite
  - Styling: Tailwind CSS v4 + `@tailwindcss/vite`
  - Theming: centralized design tokens via Tailwind `@theme` in global CSS
  - Motion: `motion/react` (Framer Motion API)
  - Icons: `lucide-react`
  - Utility helpers: `clsx` + `tailwind-merge` (`cn()` pattern)

  LIGHT MODERN WORKSPACE STYLE GUIDE (SOURCE OF TRUTH):
  1. Visual Direction: Bright, modern, design-forward "agent workspace" UI. Keep technical tone, but avoid dark terminal heaviness as the default.
  2. Border Philosophy: Prefer borderless surfaces. Use separation via elevation, contrast, spacing, and soft gradient planes. Only use ultra-subtle borders when absolutely necessary.
  3. Depth & 3D: Build hierarchy with layered shadows (`shadow-1/2/3` tokens), soft highlights, and slight lift-on-hover transforms. Depth should feel premium, not noisy.
  4. Color System: Light palette by default (`canvas`, `surface`, `surface-soft`, `text-*`, `brand-*`, `status-*`) with tokenized variables. No hard-coded one-off colors for core surfaces.
  5. Layout Pattern: Multi-pane workspace shell remains the primary pattern (app rail + session/context sidebar + main canvas + compact status footer).
  6. Typography: Dual-font hierarchy is required:
     - Sans (`Inter`) for primary content and UI readability.
     - Mono (`JetBrains Mono`) for system labels, IDs, metrics, state badges, and tooling affordances.
  7. Components: Cards, panels, bubbles, and controls should use rounded geometry plus soft elevation instead of heavy strokes.
  8. Motion Language: Fast, subtle, and purposeful transitions only (hover lift, panel state changes, content switch fades). No decorative animation clutter.
  9. Data Presentation: Keep developer-friendly readability (logs, metadata, tool output, status chips), but render in clean light containers rather than dense admin tables by default.
  10. Responsive Behavior: Preserve workspace hierarchy on desktop; progressively collapse rails/sidebars on narrow screens without breaking chat-first interaction.
  11. Prohibited Visual Smells: Thick borders, flat enterprise admin panels, harsh black/white contrast blocks, and over-saturated CTA colors.



## 参考文档
[前端样式风格](./docs/FRONT-END.md)
