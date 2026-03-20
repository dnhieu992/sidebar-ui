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
