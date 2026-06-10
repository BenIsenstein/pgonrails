---
name: add-component
description: Create a new React component using shadcn/ui primitives, Tailwind v4, and oklch theming conventions
---

# Add Component

Create a new React UI component.

## Prerequisites
- shadcn/ui installed (`src/components/ui/`)
- Tailwind v4 with oklch CSS variables
- Component conventions established in existing files

## Docs
- https://ui.shadcn.com/docs/components
- https://tailwindcss.com/docs

## Workflow

1. **Check if shadcn/ui has a matching primitive:**
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```
   This installs into `src/components/ui/`. Only do this for new primitives not already present.

2. **Create your component** in the appropriate location:
   - Reusable UI: `src/components/<name>.tsx`
   - Feature-specific: `src/components/<feature>/<name>.tsx`
   - Page-specific (one-off): inline in the route file

3. **Follow the pattern:**
   ```tsx
   import { cn } from '@/lib/utils'

   interface MyComponentProps {
     className?: string
     children?: React.ReactNode
   }

   export function MyComponent({ className, children }: MyComponentProps) {
     return (
       <div className={cn('base-classes', className)}>
         {children}
       </div>
     )
   }
   ```

## Theming

Use CSS variables from `src/app.css` — never hardcode colors:
```tsx
// Good
className="bg-background text-foreground border-border"
className="bg-primary text-primary-foreground"

// Bad
className="bg-white text-black dark:bg-gray-900"
```

Available semantic tokens: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`.

## Key Files
- `src/app.css` — CSS variables (oklch), Tailwind v4 `@theme` block
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/components/ui/` — shadcn primitives (button, card, input, etc.)
- `src/components/navbar.tsx` — Example of a composed component
- `src/components/settings/` — Example of feature-scoped components

## Pitfalls
- Always accept and forward `className` prop for composability
- Use `cn()` to merge classes (not string concatenation)
- Don't import from `*.server.ts` files — use server functions via `@/server/` instead
- Prefer named exports over default exports (matches codebase convention)
