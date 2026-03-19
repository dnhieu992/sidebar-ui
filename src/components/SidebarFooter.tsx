import type { SidebarFooterProps } from '../types';

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={`sidebar-footer ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
