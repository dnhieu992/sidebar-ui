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
