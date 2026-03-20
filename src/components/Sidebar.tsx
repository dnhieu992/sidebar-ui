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
