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
