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
