import type { SidebarHeaderProps } from '../types';

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={`sidebar-header ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
