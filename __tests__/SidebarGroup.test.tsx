import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../src/context/SidebarContext';
import { SidebarGroup } from '../src/components/SidebarGroup';

const defaultCtx = {
  collapsed: false, setCollapsed: () => {}, collapsible: true,
  width: 260, setWidth: () => {}, resizable: false,
  minWidth: 200, maxWidth: 480, overlay: false,
};

describe('SidebarGroup', () => {
  it('renders label and children', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Navigation">
          <li>Item 1</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('hides label when sidebar is collapsed', () => {
    render(
      <SidebarProvider {...{ ...defaultCtx, collapsed: true }}>
        <SidebarGroup label="Navigation">
          <li>Item 1</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    const label = screen.getByText('Navigation');
    expect(label.closest('.sidebar-group__label')).toHaveClass('sidebar-group__label--hidden');
  });

  it('supports collapsible groups', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Settings" collapsible>
          <li>Preferences</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.getByText('Preferences')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
  });

  it('supports defaultCollapsed', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Settings" collapsible defaultCollapsed>
          <li>Preferences</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('uses aria-labelledby linking label to list', () => {
    render(
      <SidebarProvider {...defaultCtx}>
        <SidebarGroup label="Nav">
          <li>Item</li>
        </SidebarGroup>
      </SidebarProvider>
    );
    const label = screen.getByText('Nav');
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-labelledby', label.id);
  });
});
