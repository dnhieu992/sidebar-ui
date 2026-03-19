# Sidebar UI Library Design

**Date:** 2026-03-19
**Status:** Approved

## Overview

A generic, reusable React sidebar navigation/layout component published to npm as `sidebar-ui`. Full-featured: collapsible, resizable, nested menu items, icons, badges, search, tooltips in collapsed mode, and mobile responsive overlay mode. Uses a compound component pattern. Ships pre-compiled CSS with CSS variable theming — no Tailwind required by consumers.

## Goals

- Provide a drop-in sidebar component for any React project
- Publish to npm public registry as `sidebar-ui`
- Ship pre-compiled CSS — consumers import one CSS file, no build tool requirements
- Expose CSS variables for full theming (including dark mode) without overriding internals
- Compound component API for flexible composition
- Accessible by default (ARIA roles, keyboard navigation, focus management)

## Scope

Core sidebar features only: navigation items, nesting, groups, collapse, resize, search, overlay mode, theming.

## Tech Stack

- **Framework:** React 18+ (peer dependency)
- **Build:** tsup (ESM + CJS + declarations), Tailwind CLI (CSS compilation)
- **Testing:** Vitest + React Testing Library
- **Styling:** Tailwind (internal build only) → pre-compiled CSS with CSS variables

---

## Section 1 — Package Structure & Build

```
sidebar-ui/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tailwind.config.ts          # internal — used to build the CSS
├── postcss.config.js
├── src/
│   ├── index.ts                # public API — exports all components + types
│   ├── styles/
│   │   └── sidebar.css         # Tailwind source styles + CSS variables
│   ├── context/
│   │   └── SidebarContext.tsx   # React context for internal state
│   ├── components/
│   │   ├── Sidebar.tsx          # Root component + compound sub-component attachment
│   │   ├── SidebarHeader.tsx
│   │   ├── SidebarFooter.tsx
│   │   ├── SidebarGroup.tsx
│   │   ├── SidebarItem.tsx      # Supports nesting for sub-items
│   │   ├── SidebarSearch.tsx
│   │   ├── SidebarToggle.tsx    # Collapse/expand trigger
│   │   └── SidebarDivider.tsx
│   └── types.ts
├── dist/                        # gitignored — compiled output
│   ├── index.js                 # ESM
│   ├── index.cjs                # CJS
│   ├── index.d.ts               # Type declarations
│   └── styles.css               # Pre-compiled CSS
└── __tests__/
```

### package.json

```json
{
  "name": "sidebar-ui",
  "version": "0.1.0",
  "description": "A reusable React sidebar navigation component",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "scripts": {
    "build:css": "tailwindcss -i src/styles/sidebar.css -o dist/styles.css --minify",
    "build:js": "tsup src/index.ts --format esm,cjs --dts",
    "build": "npm run build:css && npm run build:js",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build && npm test"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "keywords": ["react", "sidebar", "navigation", "component", "ui"],
  "license": "MIT"
}
```

### Consumer usage

```bash
npm install sidebar-ui
```

```tsx
import { Sidebar } from 'sidebar-ui';
import 'sidebar-ui/styles.css';
```

---

## Section 2 — Component API & Compound Pattern

The root `<Sidebar>` manages internal state (collapsed, resizing, mobile overlay) via React context. Sub-components are attached as static properties.

### Components

| Component | Purpose | Key Props |
|---|---|---|
| `Sidebar` | Root container, provides context | `defaultCollapsed`, `collapsed`, `collapsible`, `resizable`, `minWidth`, `maxWidth`, `defaultWidth`, `width`, `overlay`, `onCollapsedChange`, `onWidthChange`, `className`, `style` |
| `Sidebar.Header` | Top section (logo, app name) | `children`, `className` |
| `Sidebar.Footer` | Bottom section (user info, version) | `children`, `className` |
| `Sidebar.Group` | Labeled section grouping items | `label`, `collapsible`, `defaultCollapsed`, `children`, `className` |
| `Sidebar.Item` | Navigation item, supports nesting | `icon`, `badge`, `active`, `disabled`, `onClick`, `href`, `children`, `className` |
| `Sidebar.Search` | Filter/search input | `placeholder`, `onSearch`, `className` |
| `Sidebar.Toggle` | Collapse/expand button | `children` (custom icon), `className` |
| `Sidebar.Divider` | Visual separator line | `className` |

### Behavior details

- **Collapsed mode:** Sidebar shrinks to icon-only width (~64px). `Sidebar.Item` shows tooltip with label on hover. `Sidebar.Header`, `Sidebar.Footer`, `Sidebar.Search` hide their text content. `Sidebar.Group` labels hide.
- **Resizable:** User drags the right edge. Constrained by `minWidth`/`maxWidth`. Fires `onWidthChange`.
- **Nested items:** `Sidebar.Item` containing child `Sidebar.Item` elements renders as an expandable/collapsible sub-menu with indent.
- **Mobile overlay:** When `overlay` is true, sidebar renders as a fixed overlay with backdrop. Useful for responsive layouts where the consumer toggles `overlay` based on viewport.
- **Active state:** Consumer controls via `active` prop on `Sidebar.Item`. No built-in router integration.

### Full usage example

```tsx
import { Sidebar } from 'sidebar-ui';
import 'sidebar-ui/styles.css';

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar defaultWidth={260} resizable collapsible>
        <Sidebar.Header>
          <img src="/logo.svg" alt="Logo" />
          <span>My App</span>
        </Sidebar.Header>

        <Sidebar.Search placeholder="Search..." onSearch={handleSearch} />

        <Sidebar.Group label="Navigation">
          <Sidebar.Item icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
          <Sidebar.Item icon={<TaskIcon />} badge={5}>
            Tasks
            <Sidebar.Item>Active</Sidebar.Item>
            <Sidebar.Item>Completed</Sidebar.Item>
          </Sidebar.Item>
          <Sidebar.Item icon={<ProjectIcon />} href="/projects">Projects</Sidebar.Item>
        </Sidebar.Group>

        <Sidebar.Divider />

        <Sidebar.Group label="Settings" collapsible defaultCollapsed>
          <Sidebar.Item icon={<GearIcon />}>Preferences</Sidebar.Item>
        </Sidebar.Group>

        <Sidebar.Footer>
          <Sidebar.Toggle />
          <span>v1.0.0</span>
        </Sidebar.Footer>
      </Sidebar>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
```

---

## Section 3 — Styling & Theming

### CSS Variables

The pre-compiled CSS defines all visual tokens as CSS variables on `.sidebar-root`. Consumers override by setting these variables in their own CSS.

```css
.sidebar-root {
  /* Layout */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 64px;
  --sidebar-min-width: 200px;
  --sidebar-max-width: 480px;

  /* Colors */
  --sidebar-bg: #ffffff;
  --sidebar-border-color: #e5e7eb;
  --sidebar-text-color: #1f2937;
  --sidebar-text-muted: #6b7280;
  --sidebar-item-hover-bg: #f3f4f6;
  --sidebar-item-active-bg: #eff6ff;
  --sidebar-item-active-color: #2563eb;
  --sidebar-badge-bg: #2563eb;
  --sidebar-badge-color: #ffffff;
  --sidebar-overlay-backdrop: rgba(0, 0, 0, 0.4);

  /* Typography */
  --sidebar-font-family: inherit;
  --sidebar-font-size: 14px;
  --sidebar-group-label-size: 12px;

  /* Spacing */
  --sidebar-padding: 12px;
  --sidebar-item-padding: 8px 12px;
  --sidebar-item-gap: 4px;
  --sidebar-nest-indent: 24px;

  /* Shape */
  --sidebar-item-radius: 6px;

  /* Transitions */
  --sidebar-transition-duration: 200ms;
}
```

### Dark mode example

```css
[data-theme="dark"] .sidebar-root {
  --sidebar-bg: #111827;
  --sidebar-border-color: #374151;
  --sidebar-text-color: #f9fafb;
  --sidebar-text-muted: #9ca3af;
  --sidebar-item-hover-bg: #1f2937;
  --sidebar-item-active-bg: #1e3a5f;
  --sidebar-item-active-color: #60a5fa;
}
```

### CSS class structure

All classes are prefixed with `sidebar-` to avoid collisions. Every component accepts a `className` prop for additional customization.

```
.sidebar-root
.sidebar-root--collapsed
.sidebar-root--overlay
.sidebar-header
.sidebar-footer
.sidebar-group
.sidebar-group__label
.sidebar-item
.sidebar-item--active
.sidebar-item--disabled
.sidebar-item__icon
.sidebar-item__label
.sidebar-item__badge
.sidebar-item__children
.sidebar-search
.sidebar-search__input
.sidebar-toggle
.sidebar-divider
.sidebar-overlay-backdrop
.sidebar-resize-handle
```

---

## Section 4 — Internal State & Context

### SidebarContext

```ts
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  collapsible: boolean;
  width: number;
  setWidth: (width: number) => void;
  resizable: boolean;
  minWidth: number;
  maxWidth: number;
  overlay: boolean;
}
```

### State ownership

| State | Managed by | Notes |
|---|---|---|
| `collapsed` | `Sidebar` (uncontrolled by default) | Consumer can control via `collapsed` + `onCollapsedChange` |
| `width` | `Sidebar` (uncontrolled by default) | Consumer can control via `width` + `onWidthChange` |
| `overlay` | Consumer | Passed as prop |
| `group collapsed` | `SidebarGroup` (local state) | Each group manages its own expand/collapse |
| `nested item expanded` | `SidebarItem` (local state) | Each parent item manages its own sub-menu |
| `active` | Consumer | Passed as prop on `SidebarItem` |
| `search value` | `SidebarSearch` (local state) | Fires `onSearch` callback |

### Controlled vs uncontrolled

`Sidebar` supports both patterns for `collapsed` and `width`:

- **Uncontrolled** (default): Pass `defaultCollapsed` / `defaultWidth`. Internal state manages it.
- **Controlled**: Pass `collapsed` + `onCollapsedChange` / `width` + `onWidthChange`. Consumer owns the state.

### Resize implementation

1. `onMouseDown` on `.sidebar-resize-handle` starts tracking
2. `mousemove` on `document` updates width, clamped to `[minWidth, maxWidth]`
3. `mouseup` on `document` stops tracking
4. Fires `onWidthChange` on each change

All listeners attached/removed via `useEffect` cleanup. No external dependency.

---

## Section 5 — Accessibility

### ARIA roles and attributes

| Component | Element | ARIA |
|---|---|---|
| `Sidebar` | `<nav>` | `role="navigation"`, `aria-label="Sidebar"` |
| `SidebarGroup` | `<div>` with `<ul>` | `role="list"`, group label via `aria-labelledby` |
| `SidebarItem` | `<li>` wrapping `<a>` or `<button>` | `aria-current="page"` when active, `aria-disabled` when disabled |
| `SidebarItem` (parent) | expandable | `aria-expanded`, `aria-controls` pointing to sub-list ID |
| `SidebarToggle` | `<button>` | `aria-label="Collapse sidebar"` / `"Expand sidebar"`, `aria-expanded` |
| `SidebarSearch` | `<input>` | `role="searchbox"`, `aria-label="Search sidebar"` |
| Collapsed tooltip | tooltip element | `role="tooltip"`, linked via `aria-describedby` |
| Overlay backdrop | `<div>` | `aria-hidden="true"` |

### Keyboard navigation

- **Tab** moves focus through interactive items in DOM order
- **Enter/Space** activates items, expands/collapses parent items and groups
- **Escape** closes overlay sidebar (when in overlay mode)

### Focus management

- When overlay opens, focus moves to the first focusable item inside the sidebar
- When overlay closes, focus returns to the element that triggered it
- Focus trap inside overlay mode (tab cycles within sidebar until closed)

---

## Section 6 — Testing & Publishing

### Testing

**Tool:** Vitest + React Testing Library

| Category | Examples |
|---|---|
| Rendering | Sidebar renders children, collapsed mode hides labels |
| Interaction | Click toggle collapses, click item fires onClick, drag resizes |
| Compound pattern | Item reads collapsed state, Toggle updates collapsed |
| Accessibility | Active item has `aria-current`, toggle has `aria-expanded` |
| Controlled/uncontrolled | `defaultCollapsed` works, `collapsed` + `onCollapsedChange` stays in sync |
| Edge cases | Resize clamped to min/max, disabled item ignores clicks |

### Publishing

**Build pipeline:**
```
build:css    → tailwindcss -i src/styles/sidebar.css -o dist/styles.css --minify
build:js     → tsup src/index.ts --format esm,cjs --dts
build        → build:css && build:js
prepublishOnly → npm run build && npm test
```

**Versioning:** Semantic versioning, starting at `0.1.0`.

**CI (GitHub Actions):**
1. On push/PR: lint, test, build
2. On tag (`v*`): build + `npm publish`

---

## Out of Scope

- Router integration (consumer manages `active` state)
- React Native support (React DOM only for now)
- Animation library dependency (CSS transitions only)
- Icon library — consumer provides icons via `icon` prop
- Built-in themes beyond CSS variables
