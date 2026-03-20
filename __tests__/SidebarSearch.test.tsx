import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../src/context/SidebarContext';
import { SidebarSearch } from '../src/components/SidebarSearch';

const defaultCtx = {
  collapsed: false, setCollapsed: () => {}, collapsible: true,
  width: 260, setWidth: () => {}, resizable: false,
  minWidth: 200, maxWidth: 480, overlay: false,
};

describe('SidebarSearch', () => {
  it('renders a searchbox', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch placeholder="Search..." />
      </SidebarProvider>
    );
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('placeholder', 'Search...');
    expect(input).toHaveAttribute('aria-label', 'Search sidebar');
  });

  it('fires onSearch on input change', () => {
    const onSearch = vi.fn();
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch onSearch={onSearch} />
      </SidebarProvider>
    );
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('manages its own value internally', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarSearch />
      </SidebarProvider>
    );
    const input = screen.getByRole('searchbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });
});
