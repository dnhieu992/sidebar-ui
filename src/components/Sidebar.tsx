import { useState, useCallback, useRef, useEffect } from 'react';
import { SidebarProvider } from '../context/SidebarContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarItem } from './SidebarItem';
import { SidebarGroup } from './SidebarGroup';
import { SidebarSearch } from './SidebarSearch';
import { SidebarToggle } from './SidebarToggle';
import { SidebarDivider } from './SidebarDivider';
import type { SidebarProps } from '../types';

function ResizeHandle({ onResize }: { onResize: (deltaX: number) => void }) {
  const startXRef = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX ?? 0;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const clientX = e.clientX ?? 0;
    const delta = clientX - startXRef.current;
    startXRef.current = clientX;
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
      previousFocusRef.current = document.activeElement as HTMLElement;
      focusFirstElement(navRef.current);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [overlay]);

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
        ref={navRef}
        className={classes}
        style={sidebarStyle}
        aria-label={ariaLabel}
      >
        {overlay && <div tabIndex={0} onFocus={() => focusLastElement(navRef.current)} aria-hidden="true" />}
        {children}
        {resizable && !collapsed && (
          <ResizeHandle onResize={(delta) => setWidth(width + delta)} />
        )}
        {overlay && <div tabIndex={0} onFocus={() => focusFirstElement(navRef.current)} aria-hidden="true" />}
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
