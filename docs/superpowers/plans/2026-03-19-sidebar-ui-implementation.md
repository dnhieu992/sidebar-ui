# Sidebar UI Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable React sidebar component library and publish it to npm as `sidebar-ui`.

**Architecture:** Compound component pattern with React context for internal state. Tailwind compiles to pre-built CSS with CSS variables for theming. tsup bundles ESM + CJS with type declarations.

**Tech Stack:** React 18+, tsup, Tailwind CLI, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-19-sidebar-ui-library-design.md`

---

## File Map

```
sidebar-ui/
├── package.json                      # Package config, scripts, peer deps
├── tsconfig.json                     # Base TypeScript config
├── tailwind.config.ts                # Tailwind content paths for @apply compilation
├── postcss.config.js                 # PostCSS with Tailwind plugin
├── vitest.config.ts                  # Vitest + jsdom setup
├── src/test-setup.ts                 # @testing-library/jest-dom setup
├── .gitignore                        # dist/, node_modules/
├── src/
│   ├── index.ts                      # Public API barrel export
│   ├── types.ts                      # All TypeScript interfaces/types
│   ├── styles/
│   │   └── sidebar.css               # BEM classes with @apply + CSS variables
│   ├── context/
│   │   └── SidebarContext.tsx         # React context + provider + hook
│   └── components/
│       ├── Sidebar.tsx               # Root component, context provider, compound attachment
│       ├── SidebarHeader.tsx          # Header slot
│       ├── SidebarFooter.tsx          # Footer slot
│       ├── SidebarDivider.tsx         # Horizontal rule
│       ├── SidebarGroup.tsx           # Labeled, collapsible section
│       ├── SidebarItem.tsx            # Nav item with nesting, badge, icon, tooltip
│       ├── SidebarSearch.tsx          # Search input with onSearch callback
│       └── SidebarToggle.tsx          # Collapse/expand button
├── __tests__/
│   ├── Sidebar.test.tsx              # Root + compound pattern tests
│   ├── SidebarItem.test.tsx          # Item, nesting, badge, active, disabled, tooltip
│   ├── SidebarGroup.test.tsx         # Group collapse, label
│   ├── SidebarSearch.test.tsx        # Search input, onSearch callback
│   ├── SidebarResize.test.tsx        # Resize drag, min/max clamping
│   └── SidebarOverlay.test.tsx       # Overlay mode, backdrop click, escape, focus trap
└── dist/                             # gitignored build output
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `src/test-setup.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "sidebar-ui",
  "version": "0.1.0",
  "description": "A reusable React sidebar navigation component",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": ["./dist/styles.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "scripts": {
    "build:css": "tailwindcss -i src/styles/sidebar.css -o dist/styles.css --minify",
    "build:js": "tsup src/index.ts --format esm,cjs --dts --clean --external react --external react-dom",
    "build": "npm run build:css && npm run build:js",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build && npm test"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.4.0",
    "tsup": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.0.0"
  },
  "keywords": ["react", "sidebar", "navigation", "component", "ui"],
  "license": "MIT"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 3: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,css}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 6: Create src/test-setup.ts**

This setup file imports `@testing-library/jest-dom` so matchers like `toBeInTheDocument()` and `toHaveClass()` are available in all tests. It also polyfills Pointer Capture APIs that jsdom does not implement.

```ts
import '@testing-library/jest-dom';

// Polyfill Pointer Capture APIs for jsdom (not implemented natively)
if (typeof HTMLElement.prototype.setPointerCapture === 'undefined') {
  HTMLElement.prototype.setPointerCapture = function () {};
  HTMLElement.prototype.releasePointerCapture = function () {};
  HTMLElement.prototype.hasPointerCapture = function () {
    return false;
  };
}
```

- [ ] **Step 7: Update .gitignore**

```
node_modules/
dist/
.DS_Store
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: Clean install, `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json tailwind.config.ts postcss.config.js vitest.config.ts src/test-setup.ts .gitignore
git commit -m "chore: scaffold project with build tooling and test setup"
```

---

### Task 2: Types & Context

**Files:**
- Create: `src/types.ts`
- Create: `src/context/SidebarContext.tsx`

- [ ] **Step 1: Write the test for SidebarContext**

Create `__tests__/Sidebar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarProvider, useSidebarContext } from '../src/context/SidebarContext';

function TestConsumer() {
  const ctx = useSidebarContext();
  return <div data-testid="collapsed">{String(ctx.collapsed)}</div>;
}

describe('SidebarContext', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'Sidebar components must be used within <Sidebar>'
    );
  });

  it('provides default context values', () => {
    render(
      <SidebarProvider
        collapsed={false}
        setCollapsed={() => {}}
        collapsible={true}
        width={260}
        setWidth={() => {}}
        resizable={false}
        minWidth={200}
        maxWidth={480}
        overlay={false}
      >
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create src/types.ts**

```ts
import { type ReactNode, type CSSProperties } from 'react';

export interface SidebarProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  collapsible?: boolean;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  width?: number;
  overlay?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onWidthChange?: (width: number) => void;
  onOverlayClose?: () => void;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

export interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarGroupProps {
  children: ReactNode;
  label?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export interface SidebarItemProps {
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export interface SidebarSearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export interface SidebarToggleProps {
  children?: ReactNode;
  className?: string;
}

export interface SidebarDividerProps {
  className?: string;
}

export interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  collapsible: boolean;
  width: number;
  setWidth: (width: number) => void;
  resizable: boolean;
  minWidth: number;
  maxWidth: number;
  overlay: boolean;
  onOverlayClose?: () => void;
}
```

- [ ] **Step 4: Create src/context/SidebarContext.tsx**

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { SidebarContextValue } from '../types';

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('Sidebar components must be used within <Sidebar>');
  }
  return ctx;
}

export function SidebarProvider({
  children,
  ...value
}: SidebarContextValue & { children: ReactNode }) {
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/context/SidebarContext.tsx __tests__/Sidebar.test.tsx
git commit -m "feat: add types and SidebarContext with provider"
```

---

### Task 3: Simple Sub-Components (Header, Footer, Divider)

**Files:**
- Create: `src/components/SidebarHeader.tsx`
- Create: `src/components/SidebarFooter.tsx`
- Create: `src/components/SidebarDivider.tsx`

- [ ] **Step 1: Add tests to Sidebar.test.tsx**

**Note:** Tasks 3, 4, and 9 all append to `__tests__/Sidebar.test.tsx`. When appending, merge new imports with existing ones at the top of the file — do not create duplicate import statements.

Append to `__tests__/Sidebar.test.tsx`:

```tsx
import { SidebarHeader } from '../src/components/SidebarHeader';
import { SidebarFooter } from '../src/components/SidebarFooter';
import { SidebarDivider } from '../src/components/SidebarDivider';

describe('SidebarHeader', () => {
  it('renders children', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarHeader>App Title</SidebarHeader>
      </SidebarProvider>
    );
    expect(screen.getByText('App Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarHeader className="custom">Title</SidebarHeader>
      </SidebarProvider>
    );
    expect(screen.getByText('Title').closest('.sidebar-header')).toHaveClass('custom');
  });
});

describe('SidebarFooter', () => {
  it('renders children', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarFooter>v1.0</SidebarFooter>
      </SidebarProvider>
    );
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });
});

describe('SidebarDivider', () => {
  it('renders a separator', () => {
    const { container } = render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarDivider />
      </SidebarProvider>
    );
    expect(container.querySelector('.sidebar-divider')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement SidebarHeader**

```tsx
import type { SidebarHeaderProps } from '../types';

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={`sidebar-header ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Implement SidebarFooter**

```tsx
import type { SidebarFooterProps } from '../types';

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={`sidebar-footer ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Implement SidebarDivider**

```tsx
import type { SidebarDividerProps } from '../types';

export function SidebarDivider({ className }: SidebarDividerProps) {
  return <hr className={`sidebar-divider ${className ?? ''}`.trim()} />;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/SidebarHeader.tsx src/components/SidebarFooter.tsx src/components/SidebarDivider.tsx __tests__/Sidebar.test.tsx
git commit -m "feat: add SidebarHeader, SidebarFooter, SidebarDivider components"
```

---

### Task 4: SidebarToggle

**Files:**
- Create: `src/components/SidebarToggle.tsx`

- [ ] **Step 1: Add tests to Sidebar.test.tsx**

Append to `__tests__/Sidebar.test.tsx`:

```tsx
import { SidebarToggle } from '../src/components/SidebarToggle';
import { fireEvent } from '@testing-library/react';

describe('SidebarToggle', () => {
  it('renders a button with aria-label', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows "Expand sidebar" when collapsed', () => {
    render(
      <SidebarProvider
        collapsed={true} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls setCollapsed on click', () => {
    const setCollapsed = vi.fn();
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={setCollapsed} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(setCollapsed).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement SidebarToggle**

```tsx
import { useSidebarContext } from '../context/SidebarContext';
import type { SidebarToggleProps } from '../types';

export function SidebarToggle({ children, className }: SidebarToggleProps) {
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <button
      type="button"
      className={`sidebar-toggle ${className ?? ''}`.trim()}
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
    >
      {children ?? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {collapsed ? (
            <polyline points="6 3 11 8 6 13" />
          ) : (
            <polyline points="11 3 6 8 11 13" />
          )}
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SidebarToggle.tsx __tests__/Sidebar.test.tsx
git commit -m "feat: add SidebarToggle with collapse/expand and ARIA"
```

---

### Task 5: SidebarItem (basic — icon, badge, active, disabled, href)

**Files:**
- Create: `src/components/SidebarItem.tsx`
- Create: `__tests__/SidebarItem.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/SidebarItem.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../src/context/SidebarContext';
import { SidebarItem } from '../src/components/SidebarItem';

const defaultCtx = {
  collapsed: false, setCollapsed: () => {}, collapsible: true,
  width: 260, setWidth: () => {}, resizable: false,
  minWidth: 200, maxWidth: 480, overlay: false,
};

function renderItem(props: any = {}) {
  return render(
    <SidebarProvider {...defaultCtx}>
      <ul>
        <SidebarItem {...props}>{props.children ?? 'Dashboard'}</SidebarItem>
      </ul>
    </SidebarProvider>
  );
}

describe('SidebarItem', () => {
  it('renders as a button by default', () => {
    renderItem();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    renderItem({ href: '/home' });
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders icon', () => {
    renderItem({ icon: <span data-testid="icon">I</span> });
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders badge', () => {
    renderItem({ badge: 5 });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('sets aria-current when active', () => {
    renderItem({ active: true });
    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when not active', () => {
    renderItem();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current');
  });

  it('handles disabled state', () => {
    const onClick = vi.fn();
    renderItem({ disabled: true, onClick });
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    renderItem({ onClick });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies active class', () => {
    const { container } = renderItem({ active: true });
    expect(container.querySelector('.sidebar-item--active')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/SidebarItem.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement SidebarItem (basic)**

```tsx
import { type ReactNode, useState, useId } from 'react';
import { useSidebarContext } from '../context/SidebarContext';
import type { SidebarItemProps } from '../types';

function hasChildItems(children: ReactNode): boolean {
  const childArray = Array.isArray(children) ? children : [children];
  return childArray.some(
    (child) =>
      child != null &&
      typeof child === 'object' &&
      'type' in child &&
      (child.type === SidebarItem || (child.type as any)?.displayName === 'SidebarItem')
  );
}

export function SidebarItem({
  children,
  icon,
  badge,
  active,
  disabled,
  onClick,
  href,
  className,
}: SidebarItemProps) {
  const { collapsed } = useSidebarContext();
  const tooltipId = useId();
  const subListId = useId();
  const [expanded, setExpanded] = useState(false);

  // Separate text/element children from nested SidebarItem children
  const childArray = Array.isArray(children) ? children : [children];
  const nestedItems: ReactNode[] = [];
  const labelContent: ReactNode[] = [];

  childArray.forEach((child) => {
    if (
      child != null &&
      typeof child === 'object' &&
      'type' in child &&
      (child.type === SidebarItem || (child.type as any)?.displayName === 'SidebarItem')
    ) {
      nestedItems.push(child);
    } else {
      labelContent.push(child);
    }
  });

  const hasNested = nestedItems.length > 0;
  const classes = [
    'sidebar-item',
    active && 'sidebar-item--active',
    disabled && 'sidebar-item--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (disabled) return;
    if (hasNested) {
      setExpanded(!expanded);
    }
    onClick?.();
  };

  const content = (
    <>
      {icon && <span className="sidebar-item__icon">{icon}</span>}
      <span className="sidebar-item__label">{labelContent}</span>
      {badge != null && <span className="sidebar-item__badge">{badge}</span>}
      {collapsed && (
        <span className="sidebar-item__tooltip" role="tooltip" id={tooltipId}>
          {labelContent}
        </span>
      )}
    </>
  );

  const ariaProps: Record<string, any> = {};
  if (active) ariaProps['aria-current'] = 'page';
  if (disabled) ariaProps['aria-disabled'] = 'true';
  if (hasNested) {
    ariaProps['aria-expanded'] = expanded;
    ariaProps['aria-controls'] = subListId;
  }
  if (collapsed) ariaProps['aria-describedby'] = tooltipId;

  const element = href && !disabled ? (
    <a href={href} className={classes} {...ariaProps} onClick={disabled ? undefined : onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className={classes} onClick={handleClick} {...ariaProps}>
      {content}
    </button>
  );

  return (
    <li className="sidebar-item__wrapper">
      {element}
      {hasNested && expanded && (
        <ul id={subListId} className="sidebar-item__children" role="list">
          {nestedItems}
        </ul>
      )}
    </li>
  );
}

SidebarItem.displayName = 'SidebarItem';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/SidebarItem.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SidebarItem.tsx __tests__/SidebarItem.test.tsx
git commit -m "feat: add SidebarItem with icon, badge, active, disabled, href"
```

---

### Task 6: SidebarItem Nesting & Collapsed Tooltip

**Files:**
- Modify: `__tests__/SidebarItem.test.tsx`

- [ ] **Step 1: Add nesting and tooltip tests**

Append to `__tests__/SidebarItem.test.tsx`:

```tsx
describe('SidebarItem nesting', () => {
  it('renders nested items when expanded', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarItem icon={<span>I</span>}>
          Tasks
          <SidebarItem>Active</SidebarItem>
          <SidebarItem>Completed</SidebarItem>
        </SidebarItem>
      </SidebarProvider>
    );
    // Initially collapsed — nested items not visible
    expect(screen.queryByText('Active')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('sets aria-expanded on parent item', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarItem>
          Tasks
          <SidebarItem>Active</SidebarItem>
        </SidebarItem>
      </SidebarProvider>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('SidebarItem collapsed tooltip', () => {
  it('renders tooltip span when sidebar is collapsed', () => {
    const { container } = render(
      <SidebarProvider {...{ ...defaultCtx, collapsed: true }}>
        <SidebarItem>Dashboard</SidebarItem>
      </SidebarProvider>
    );
    const tooltip = container.querySelector('[role="tooltip"]');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Dashboard');
  });

  it('does not render tooltip when sidebar is expanded', () => {
    const { container } = render(
      <SidebarProvider {...defaultCtx}>
        <SidebarItem>Dashboard</SidebarItem>
      </SidebarProvider>
    );
    expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run __tests__/SidebarItem.test.tsx`
Expected: All tests PASS (nesting and tooltip logic was implemented in Task 5).

- [ ] **Step 3: Commit**

```bash
git add __tests__/SidebarItem.test.tsx
git commit -m "test: add nesting and collapsed tooltip tests for SidebarItem"
```

---

### Task 7: SidebarGroup

**Files:**
- Create: `src/components/SidebarGroup.tsx`
- Create: `__tests__/SidebarGroup.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/SidebarGroup.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../src/context/SidebarContext';
import { SidebarGroup } from '../src/components/SidebarGroup';

const defaultCtx = {
  collapsed: false, setCollapsed: () => {}, collapsible: true,
  width: 260, setWidth: () => {}, resizable: false,
  minWidth: 200, maxWidth: 480, overlay: false,
};

describe('SidebarGroup', () => {
  it('renders label and children', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Navigation">
          <li>Item 1</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('hides label when sidebar is collapsed', () => {
    render(
      <SidebarProvider {...{ ...defaultCtx, collapsed: true }}>
        <SidebarGroup label="Navigation">
          <li>Item 1</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    const label = screen.getByText('Navigation');
    expect(label.closest('.sidebar-group__label')).toHaveClass('sidebar-group__label--hidden');
  });

  it('supports collapsible groups', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Settings" collapsible>
          <li>Preferences</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.getByText('Preferences')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
  });

  it('supports defaultCollapsed', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Settings" collapsible defaultCollapsed>
          <li>Preferences</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('uses aria-labelledby linking label to list', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Nav">
          <li>Item</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    const label = screen.getByText('Nav');
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-labelledby', label.id);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/SidebarGroup.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement SidebarGroup**

```tsx
import { useState, useId } from 'react';
import { useSidebarContext } from '../context/SidebarContext';
import type { SidebarGroupProps } from '../types';

export function SidebarGroup({
  children,
  label,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: SidebarGroupProps) {
  const { collapsed: sidebarCollapsed } = useSidebarContext();
  const [groupCollapsed, setGroupCollapsed] = useState(defaultCollapsed);
  const labelId = useId();

  const labelClasses = [
    'sidebar-group__label',
    sidebarCollapsed && 'sidebar-group__label--hidden',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`sidebar-group ${className ?? ''}`.trim()}>
      {label && (
        collapsible ? (
          <button
            type="button"
            id={labelId}
            className={labelClasses}
            onClick={() => setGroupCollapsed(!groupCollapsed)}
            aria-expanded={!groupCollapsed}
          >
            {label}
          </button>
        ) : (
          <span id={labelId} className={labelClasses}>
            {label}
          </span>
        )
      )}
      {!groupCollapsed && (
        <ul role="list" aria-labelledby={label ? labelId : undefined}>
          {children}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/SidebarGroup.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SidebarGroup.tsx __tests__/SidebarGroup.test.tsx
git commit -m "feat: add SidebarGroup with label, collapsible, and ARIA"
```

---

### Task 8: SidebarSearch

**Files:**
- Create: `src/components/SidebarSearch.tsx`
- Create: `__tests__/SidebarSearch.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/SidebarSearch.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../src/context/SidebarContext';
import { SidebarSearch } from '../src/components/SidebarSearch';

const defaultCtx = {
  collapsed: false, setCollapsed: () => {}, collapsible: true,
  width: 260, setWidth: () => {}, resizable: false,
  minWidth: 200, maxWidth: 480, overlay: false,
};

describe('SidebarSearch', () => {
  it('renders a searchbox', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch placeholder="Search..." />
      </SidebarProvider>
    );
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('placeholder', 'Search...');
    expect(input).toHaveAttribute('aria-label', 'Search sidebar');
  });

  it('fires onSearch on input change', () => {
    const onSearch = vi.fn();
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch onSearch={onSearch} />
      </SidebarProvider>
    );
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('manages its own value internally', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch />
      </SidebarProvider>
    );
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/SidebarSearch.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement SidebarSearch**

```tsx
import { useState } from 'react';
import type { SidebarSearchProps } from '../types';

export function SidebarSearch({ placeholder, onSearch, className }: SidebarSearchProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <div className={`sidebar-search ${className ?? ''}`.trim()}>
      <input
        type="text"
        role="searchbox"
        className="sidebar-search__input"
        placeholder={placeholder}
        aria-label="Search sidebar"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/SidebarSearch.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SidebarSearch.tsx __tests__/SidebarSearch.test.tsx
git commit -m "feat: add SidebarSearch with onSearch callback"
```

---

### Task 9: Root Sidebar Component (compound assembly, controlled/uncontrolled)

**Files:**
- Create: `src/components/Sidebar.tsx`
- Modify: `__tests__/Sidebar.test.tsx`

- [ ] **Step 1: Add root Sidebar tests**

Append to `__tests__/Sidebar.test.tsx`:

```tsx
import { Sidebar } from '../src/components/Sidebar';
import { useState } from 'react';

describe('Sidebar (root)', () => {
  it('renders as nav with aria-label', () => {
    render(<Sidebar>Content</Sidebar>);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Sidebar');
  });

  it('supports custom aria-label', () => {
    render(<Sidebar aria-label="Main navigation">Content</Sidebar>);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('renders children', () => {
    render(<Sidebar>Hello Sidebar</Sidebar>);
    expect(screen.getByText('Hello Sidebar')).toBeInTheDocument();
  });

  it('has compound sub-components', () => {
    expect(Sidebar.Header).toBeDefined();
    expect(Sidebar.Footer).toBeDefined();
    expect(Sidebar.Item).toBeDefined();
    expect(Sidebar.Group).toBeDefined();
    expect(Sidebar.Search).toBeDefined();
    expect(Sidebar.Toggle).toBeDefined();
    expect(Sidebar.Divider).toBeDefined();
  });

  it('supports uncontrolled collapsed with defaultCollapsed', () => {
    render(
      <Sidebar collapsible defaultCollapsed>
        <Sidebar.Toggle />
      </Sidebar>
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sidebar-root--collapsed');

    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(nav).not.toHaveClass('sidebar-root--collapsed');
  });

  it('supports controlled collapsed', () => {
    function Controlled() {
      const [c, setC] = useState(false);
      return (
        <Sidebar collapsible collapsed={c} onCollapsedChange={setC}>
          <Sidebar.Toggle />
          <span data-testid="state">{String(c)}</span>
        </Sidebar>
      );
    }
    render(<Controlled />);
    expect(screen.getByTestId('state').textContent).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByTestId('state').textContent).toBe('true');
  });

  it('applies overlay class', () => {
    render(<Sidebar overlay>Content</Sidebar>);
    expect(screen.getByRole('navigation').closest('.sidebar-root')).toHaveClass('sidebar-root--overlay');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: FAIL — `Sidebar` import not found.

- [ ] **Step 3: Implement Sidebar root component**

```tsx
import { useState, useCallback } from 'react';
import { SidebarProvider } from '../context/SidebarContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarSearch } from './SidebarSearch';
import { SidebarToggle } from './SidebarToggle';
import { SidebarDivider } from './SidebarDivider';
import type { SidebarProps } from '../types';

function SidebarRoot({
  children,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  collapsible = false,
  resizable = false,
  minWidth = 200,
  maxWidth = 480,
  defaultWidth = 260,
  width: controlledWidth,
  overlay = false,
  onCollapsedChange,
  onWidthChange,
  onOverlayClose,
  'aria-label': ariaLabel = 'Sidebar',
  className,
  style,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [internalWidth, setInternalWidth] = useState(defaultWidth);

  const isControlledCollapsed = controlledCollapsed !== undefined;
  const collapsed = isControlledCollapsed ? controlledCollapsed : internalCollapsed;

  const isControlledWidth = controlledWidth !== undefined;
  const width = isControlledWidth ? controlledWidth : internalWidth;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (!isControlledCollapsed) setInternalCollapsed(value);
      onCollapsedChange?.(value);
    },
    [isControlledCollapsed, onCollapsedChange]
  );

  const setWidth = useCallback(
    (value: number) => {
      const clamped = Math.min(maxWidth, Math.max(minWidth, value));
      if (!isControlledWidth) setInternalWidth(clamped);
      onWidthChange?.(clamped);
    },
    [isControlledWidth, minWidth, maxWidth, onWidthChange]
  );

  const classes = [
    'sidebar-root',
    collapsed && 'sidebar-root--collapsed',
    overlay && 'sidebar-root--overlay',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sidebarStyle = {
    ...style,
    width: collapsed ? undefined : `${width}px`,
  };

  return (
    <SidebarProvider
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      collapsible={collapsible}
      width={width}
      setWidth={setWidth}
      resizable={resizable}
      minWidth={minWidth}
      maxWidth={maxWidth}
      overlay={overlay}
      onOverlayClose={onOverlayClose}
    >
      {overlay && (
        <div
          className="sidebar-overlay-backdrop"
          aria-hidden="true"
          onClick={onOverlayClose}
        />
      )}
      <nav
        className={classes}
        style={sidebarStyle}
        aria-label={ariaLabel}
      >
        {children}
        {resizable && !collapsed && (
          <div className="sidebar-resize-handle" />
        )}
      </nav>
    </SidebarProvider>
  );
}

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Footer: SidebarFooter,
  Item: SidebarItem,
  Group: SidebarGroup,
  Search: SidebarSearch,
  Toggle: SidebarToggle,
  Divider: SidebarDivider,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/Sidebar.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.tsx __tests__/Sidebar.test.tsx
git commit -m "feat: add root Sidebar with compound pattern and controlled/uncontrolled state"
```

---

### Task 10: Resize Functionality

**Files:**
- Modify: `src/components/Sidebar.tsx` (add resize handler)
- Create: `__tests__/SidebarResize.test.tsx`

- [ ] **Step 1: Write resize tests**

Create `__tests__/SidebarResize.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';

describe('Sidebar resize', () => {
  it('renders resize handle when resizable', () => {
    const { container } = render(<Sidebar resizable>Content</Sidebar>);
    expect(container.querySelector('.sidebar-resize-handle')).toBeInTheDocument();
  });

  it('does not render resize handle when not resizable', () => {
    const { container } = render(<Sidebar>Content</Sidebar>);
    expect(container.querySelector('.sidebar-resize-handle')).not.toBeInTheDocument();
  });

  it('does not render resize handle when collapsed', () => {
    const { container } = render(
      <Sidebar resizable collapsible defaultCollapsed>
        Content
      </Sidebar>
    );
    expect(container.querySelector('.sidebar-resize-handle')).not.toBeInTheDocument();
  });

  it('resizes on pointer drag', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 300 });
    fireEvent.pointerUp(handle);

    expect(onWidthChange).toHaveBeenCalled();
  });

  it('clamps width to minWidth', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 100 });
    fireEvent.pointerUp(handle);

    const lastCall = onWidthChange.mock.calls[onWidthChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(200);
  });

  it('clamps width to maxWidth', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 600 });
    fireEvent.pointerUp(handle);

    const lastCall = onWidthChange.mock.calls[onWidthChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/SidebarResize.test.tsx`
Expected: FAIL on pointer drag tests (handle exists but no drag logic yet).

- [ ] **Step 3: Add resize logic to Sidebar.tsx**

Add a `ResizeHandle` component inside `src/components/Sidebar.tsx` (above `SidebarRoot`):

```tsx
import { useState, useCallback, useRef } from 'react';

function ResizeHandle({ onResize }: { onResize: (deltaX: number) => void }) {
  const startXRef = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    onResize(delta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="sidebar-resize-handle"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
```

Then in `SidebarRoot`, replace the static `<div className="sidebar-resize-handle" />` with:

```tsx
{resizable && !collapsed && (
  <ResizeHandle onResize={(delta) => setWidth(width + delta)} />
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/SidebarResize.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.tsx __tests__/SidebarResize.test.tsx
git commit -m "feat: add pointer-based resize with min/max clamping"
```

---

### Task 11: Overlay Mode (backdrop, Escape, focus trap)

**Files:**
- Modify: `src/components/Sidebar.tsx` (add Escape handler, focus trap)
- Create: `__tests__/SidebarOverlay.test.tsx`

- [ ] **Step 1: Write overlay tests**

Create `__tests__/SidebarOverlay.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';

describe('Sidebar overlay', () => {
  it('renders backdrop when overlay is true', () => {
    const { container } = render(<Sidebar overlay>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).toBeInTheDocument();
  });

  it('does not render backdrop when overlay is false', () => {
    const { container } = render(<Sidebar>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).not.toBeInTheDocument();
  });

  it('backdrop has aria-hidden', () => {
    const { container } = render(<Sidebar overlay>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onOverlayClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Sidebar overlay onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.click(container.querySelector('.sidebar-overlay-backdrop')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onOverlayClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Sidebar overlay onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onOverlayClose on Escape when not in overlay mode', () => {
    const onClose = vi.fn();
    render(
      <Sidebar onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Sidebar overlay focus management', () => {
  it('moves focus to the first focusable element when overlay opens', () => {
    render(
      <Sidebar overlay>
        <Sidebar.Item>First</Sidebar.Item>
        <Sidebar.Item>Second</Sidebar.Item>
      </Sidebar>
    );
    // The first interactive item inside the sidebar should be focused
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /First/i }));
  });

  it('traps focus within the sidebar in overlay mode', () => {
    render(
      <Sidebar overlay>
        <Sidebar.Item>Only Item</Sidebar.Item>
      </Sidebar>
    );
    const btn = screen.getByRole('button', { name: /Only Item/i });
    btn.focus();
    // Tab past the last element should cycle back (sentinel redirects focus)
    // We verify the sentinel elements exist with tabIndex
    const sentinels = document.querySelectorAll('[aria-hidden="true"][tabindex="0"]');
    expect(sentinels.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/SidebarOverlay.test.tsx`
Expected: FAIL on Escape key test (no keydown handler yet).

- [ ] **Step 3: Add Escape handler and focus trap to Sidebar.tsx**

Add to `SidebarRoot` component body (inside the component function):

```tsx
import { useState, useCallback, useRef, useEffect } from 'react';

// Inside SidebarRoot, add:
const navRef = useRef<HTMLElement>(null);
const previousFocusRef = useRef<HTMLElement | null>(null);

// Escape key handler
useEffect(() => {
  if (!overlay) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOverlayClose?.();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [overlay, onOverlayClose]);

// Focus management: auto-focus on open, restore on close
useEffect(() => {
  if (overlay) {
    // Save the currently focused element before moving focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Move focus to the first focusable element inside the sidebar
    focusFirstElement(navRef.current);
  } else if (previousFocusRef.current) {
    // Restore focus to the element that was focused before overlay opened
    previousFocusRef.current.focus();
    previousFocusRef.current = null;
  }
}, [overlay]);

// Focus trap sentinels — add inside the nav when overlay is true
// Before children:
{overlay && <div tabIndex={0} onFocus={() => focusLastElement(navRef.current)} aria-hidden="true" />}
// After children:
{overlay && <div tabIndex={0} onFocus={() => focusFirstElement(navRef.current)} aria-hidden="true" />}
```

Add helper functions above `SidebarRoot`:

```tsx
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])'
    )
  );
}

function focusFirstElement(container: HTMLElement | null) {
  const elements = getFocusableElements(container);
  elements[0]?.focus();
}

function focusLastElement(container: HTMLElement | null) {
  const elements = getFocusableElements(container);
  elements[elements.length - 1]?.focus();
}
```

Add `ref={navRef}` to the `<nav>` element.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/SidebarOverlay.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.tsx __tests__/SidebarOverlay.test.tsx
git commit -m "feat: add overlay mode with backdrop, Escape key, and focus trap"
```

---

### Task 12: CSS Styles

**Files:**
- Create: `src/styles/sidebar.css`

- [ ] **Step 1: Create the Tailwind source CSS with BEM classes and CSS variables**

Create `src/styles/sidebar.css`:

```css
@tailwind base;
@tailwind utilities;

/* ===========================
   CSS Variables (theming)
   =========================== */

.sidebar-root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 64px;
  --sidebar-min-width: 200px;
  --sidebar-max-width: 480px;

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

  --sidebar-font-family: inherit;
  --sidebar-font-size: 14px;
  --sidebar-group-label-size: 12px;

  --sidebar-padding: 12px;
  --sidebar-item-padding: 8px 12px;
  --sidebar-item-gap: 4px;
  --sidebar-nest-indent: 24px;

  --sidebar-item-radius: 6px;

  --sidebar-transition-duration: 200ms;
}

/* ===========================
   Root
   =========================== */

.sidebar-root {
  @apply flex flex-col relative h-full overflow-hidden;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text-color);
  font-family: var(--sidebar-font-family);
  font-size: var(--sidebar-font-size);
  border-right: 1px solid var(--sidebar-border-color);
  transition: width var(--sidebar-transition-duration) ease;
  padding: var(--sidebar-padding);
}

.sidebar-root--collapsed {
  width: var(--sidebar-collapsed-width) !important;
}

.sidebar-root--overlay {
  @apply fixed top-0 left-0 z-50 h-full;
}

/* ===========================
   Overlay Backdrop
   =========================== */

.sidebar-overlay-backdrop {
  @apply fixed inset-0 z-40;
  background-color: var(--sidebar-overlay-backdrop);
}

/* ===========================
   Header
   =========================== */

.sidebar-header {
  @apply flex items-center gap-3 mb-4;
  padding: var(--sidebar-item-padding);
}

.sidebar-root--collapsed .sidebar-header {
  @apply justify-center;
}

.sidebar-root--collapsed .sidebar-header span,
.sidebar-root--collapsed .sidebar-header p {
  @apply hidden;
}

/* ===========================
   Footer
   =========================== */

.sidebar-footer {
  @apply flex items-center gap-3 mt-auto pt-4;
  padding: var(--sidebar-item-padding);
  border-top: 1px solid var(--sidebar-border-color);
}

/* ===========================
   Divider
   =========================== */

.sidebar-divider {
  @apply border-0 my-2;
  border-top: 1px solid var(--sidebar-border-color);
}

/* ===========================
   Group
   =========================== */

.sidebar-group {
  @apply mb-2;
}

.sidebar-group__label {
  @apply block uppercase tracking-wider font-semibold mb-1;
  font-size: var(--sidebar-group-label-size);
  color: var(--sidebar-text-muted);
  padding: var(--sidebar-item-padding);
  background: none;
  border: none;
  cursor: default;
  text-align: left;
  width: 100%;
}

button.sidebar-group__label {
  @apply cursor-pointer;
}

button.sidebar-group__label:hover {
  background-color: var(--sidebar-item-hover-bg);
  border-radius: var(--sidebar-item-radius);
}

.sidebar-group__label--hidden {
  @apply invisible h-0 overflow-hidden mb-0 p-0;
}

.sidebar-group ul {
  @apply list-none p-0 m-0;
  display: flex;
  flex-direction: column;
  gap: var(--sidebar-item-gap);
}

/* ===========================
   Item
   =========================== */

.sidebar-item__wrapper {
  @apply list-none;
}

.sidebar-item {
  @apply flex items-center gap-3 w-full no-underline relative;
  padding: var(--sidebar-item-padding);
  border-radius: var(--sidebar-item-radius);
  color: var(--sidebar-text-color);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--sidebar-font-size);
  font-family: var(--sidebar-font-family);
  text-align: left;
  transition: background-color var(--sidebar-transition-duration) ease,
              color var(--sidebar-transition-duration) ease;
}

.sidebar-item:hover:not(.sidebar-item--disabled) {
  background-color: var(--sidebar-item-hover-bg);
}

.sidebar-item--active {
  background-color: var(--sidebar-item-active-bg);
  color: var(--sidebar-item-active-color);
}

.sidebar-item--disabled {
  @apply opacity-50 cursor-not-allowed;
}

.sidebar-item__icon {
  @apply flex-shrink-0 flex items-center justify-center;
  width: 20px;
  height: 20px;
}

.sidebar-item__label {
  @apply flex-1 truncate;
}

.sidebar-root--collapsed .sidebar-item__label {
  @apply hidden;
}

.sidebar-item__badge {
  @apply inline-flex items-center justify-center text-xs font-medium rounded-full;
  background-color: var(--sidebar-badge-bg);
  color: var(--sidebar-badge-color);
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
}

.sidebar-root--collapsed .sidebar-item__badge {
  @apply hidden;
}

/* ===========================
   Item Tooltip (collapsed mode)
   =========================== */

.sidebar-item__tooltip {
  @apply invisible opacity-0 absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap z-50 pointer-events-none;
  background-color: var(--sidebar-text-color);
  color: var(--sidebar-bg);
  transition: opacity var(--sidebar-transition-duration) ease;
}

.sidebar-root--collapsed .sidebar-item:hover .sidebar-item__tooltip {
  @apply visible opacity-100;
}

/* Not in collapsed mode — hide tooltip completely */
.sidebar-root:not(.sidebar-root--collapsed) .sidebar-item__tooltip {
  @apply hidden;
}

/* ===========================
   Nested Items
   =========================== */

.sidebar-item__children {
  @apply list-none p-0 m-0;
  padding-left: var(--sidebar-nest-indent);
  display: flex;
  flex-direction: column;
  gap: var(--sidebar-item-gap);
}

/* ===========================
   Search
   =========================== */

.sidebar-search {
  @apply mb-3;
  padding: 0 var(--sidebar-padding);
}

.sidebar-search__input {
  @apply w-full rounded border outline-none;
  padding: var(--sidebar-item-padding);
  border-color: var(--sidebar-border-color);
  font-size: var(--sidebar-font-size);
  font-family: var(--sidebar-font-family);
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text-color);
}

.sidebar-search__input:focus {
  border-color: var(--sidebar-item-active-color);
  box-shadow: 0 0 0 1px var(--sidebar-item-active-color);
}

.sidebar-root--collapsed .sidebar-search {
  @apply hidden;
}

/* ===========================
   Toggle
   =========================== */

.sidebar-toggle {
  @apply flex items-center justify-center rounded;
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--sidebar-text-muted);
  transition: background-color var(--sidebar-transition-duration) ease;
}

.sidebar-toggle:hover {
  background-color: var(--sidebar-item-hover-bg);
}

/* ===========================
   Resize Handle
   =========================== */

.sidebar-resize-handle {
  @apply absolute top-0 right-0 w-1 h-full cursor-col-resize;
  background-color: transparent;
  transition: background-color var(--sidebar-transition-duration) ease;
}

.sidebar-resize-handle:hover {
  background-color: var(--sidebar-item-active-color);
}
```

- [ ] **Step 2: Verify CSS builds**

Run: `npx tailwindcss -i src/styles/sidebar.css -o dist/styles.css --minify`
Expected: `dist/styles.css` created with compiled CSS, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/sidebar.css
git commit -m "feat: add complete Tailwind source CSS with BEM classes and CSS variables"
```

---

### Task 13: Public API & Barrel Export

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Create barrel export**

```ts
export { Sidebar } from './components/Sidebar';
export { SidebarHeader } from './components/SidebarHeader';
export { SidebarFooter } from './components/SidebarFooter';
export { SidebarGroup } from './components/SidebarGroup';
export { SidebarItem } from './components/SidebarItem';
export { SidebarSearch } from './components/SidebarSearch';
export { SidebarToggle } from './components/SidebarToggle';
export { SidebarDivider } from './components/SidebarDivider';

export type {
  SidebarProps,
  SidebarHeaderProps,
  SidebarFooterProps,
  SidebarGroupProps,
  SidebarItemProps,
  SidebarSearchProps,
  SidebarToggleProps,
  SidebarDividerProps,
} from './types';
```

- [ ] **Step 2: Verify full build**

Run: `npm run build`
Expected: `dist/` contains `index.js`, `index.cjs`, `index.d.ts`, `styles.css`. No errors.

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: add barrel export with all components and types"
```

---

### Task 14: Full Build Verification & Smoke Test

**Files:**
- None (verification only)

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && npm run build`
Expected: Clean build, `dist/` contains all 4 output files.

- [ ] **Step 2: Verify package contents**

Run: `npm pack --dry-run`
Expected: Only `dist/` files listed. No `src/`, `__tests__/`, or config files.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: All tests PASS.

- [ ] **Step 4: Verify types resolve**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit any fixes if needed, then tag**

```bash
git add -A
git commit -m "chore: verify build and package output"
```

---

### Task 15: CI Setup (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions for test, build, and npm publish"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | package.json, tsconfig, configs |
| 2 | Types & Context | types.ts, SidebarContext.tsx |
| 3 | Header, Footer, Divider | 3 simple components |
| 4 | SidebarToggle | Toggle with ARIA |
| 5 | SidebarItem (basic) | Icon, badge, active, disabled, href |
| 6 | SidebarItem nesting & tooltip | Nested sub-items, collapsed tooltip |
| 7 | SidebarGroup | Labeled, collapsible sections |
| 8 | SidebarSearch | Search input with callback |
| 9 | Root Sidebar | Compound assembly, controlled/uncontrolled |
| 10 | Resize | Pointer-based drag resize |
| 11 | Overlay mode | Backdrop, Escape, focus trap |
| 12 | CSS styles | Full Tailwind source with BEM + variables |
| 13 | Barrel export | Public API |
| 14 | Build verification | Smoke test |
| 15 | CI | GitHub Actions |
