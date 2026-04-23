TECH STACK:
HTML5, React, CSS, and Tailwind CSS.

DESIGN PHILOSOPHY & CONSTRAINTS (CRITICAL):
1. Aesthetic Target: Minimalist, modern, design-centric, and premium. Think of the design languages used by Apple, Vercel, Linear, or Stripe. "Less is more."
2. NO Admin Dashboard Vibes: Strictly avoid the standard, clunky B2B enterprise look. Do not use generic card layouts with heavy drop shadows, thick borders, or overly saturated primary colors. 
3. Component Library Overrides: If you use UI libraries like `@douyinfe/semi-ui` or `ant-design` to speed up development, you MUST heavily override their default styles. Strip away their native "admin" feel. Use Tailwind to override their borders, border-radii, backgrounds, and shadows to fit a modern consumer-facing or premium SaaS aesthetic.
4. Typography & Whitespace: Use generous whitespace (padding/margins). Prioritize clean typography (e.g., Inter, SF Pro, or custom sans-serifs). Use subtle font-weight contrasts and gray-scale text for visual hierarchy rather than pure black/white.
5. Micro-interactions: Implement smooth CSS transitions (e.g., `transition-all duration-300 ease-in-out`) on hover states. 
6. Borders & Shadows: Use ultra-thin borders (`border border-gray-200/50` or `border-white/10`) and very diffuse, soft shadows ONLY when necessary to elevate elements.