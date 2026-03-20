import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider, useSidebarContext } from '../src/context/SidebarContext';
import { SidebarHeader } from '../src/components/SidebarHeader';
import { SidebarFooter } from '../src/components/SidebarFooter';
import { SidebarDivider } from '../src/components/SidebarDivider';
import { SidebarToggle } from '../src/components/SidebarToggle';

function TestConsumer() {
  const ctx = useSidebarContext();
  return <div data-testid="collapsed">{String(ctx.collapsed)}</div>;
}

describe('SidebarContext', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'Sidebar components must be used within <Sidebar>'
    );
  });

  it('provides default context values', () => {
    render(
      <SidebarProvider
        collapsed={false}
        setCollapsed={() => {}}
        collapsible={true}
        width={260}
        setWidth={() => {}}
        resizable={false}
        minWidth={200}
        maxWidth={480}
        overlay={false}
      >
        <TestConsumer />
      </SidebarProvider>
    );
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
  });
});

describe('SidebarHeader', () => {
  it('renders children', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarHeader>App Title</SidebarHeader>
      </SidebarProvider>
    );
    expect(screen.getByText('App Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarHeader className="custom">Title</SidebarHeader>
      </SidebarProvider>
    );
    expect(screen.getByText('Title').closest('.sidebar-header')).toHaveClass('custom');
  });
});

describe('SidebarFooter', () => {
  it('renders children', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarFooter>v1.0</SidebarFooter>
      </SidebarProvider>
    );
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });
});

describe('SidebarDivider', () => {
  it('renders a separator', () => {
    const { container } = render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarDivider />
      </SidebarProvider>
    );
    expect(container.querySelector('.sidebar-divider')).toBeInTheDocument();
  });
});

describe('SidebarToggle', () => {
  it('renders a button with aria-label', () => {
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows "Expand sidebar" when collapsed', () => {
    render(
      <SidebarProvider
        collapsed={true} setCollapsed={() => {}} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    const btn = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls setCollapsed on click', () => {
    const setCollapsed = vi.fn();
    render(
      <SidebarProvider
        collapsed={false} setCollapsed={setCollapsed} collapsible={true}
        width={260} setWidth={() => {}} resizable={false}
        minWidth={200} maxWidth={480} overlay={false}
      >
        <SidebarToggle />
      </SidebarProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(setCollapsed).toHaveBeenCalledWith(true);
  });
});
