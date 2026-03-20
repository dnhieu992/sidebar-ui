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
