import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SidebarProvider, useSidebarContext } from '../src/context/SidebarContext';

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
