import type { SidebarDividerProps } from '../types';

export function SidebarDivider({ className }: SidebarDividerProps) {
  return <hr className={`sidebar-divider ${className ?? ''}`.trim()} />;
}
