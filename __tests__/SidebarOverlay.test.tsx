import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';

describe('Sidebar overlay', () => {
  it('renders backdrop when overlay is true', () => {
    const { container } = render(<Sidebar overlay>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).toBeInTheDocument();
  });

  it('does not render backdrop when overlay is false', () => {
    const { container } = render(<Sidebar>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).not.toBeInTheDocument();
  });

  it('backdrop has aria-hidden', () => {
    const { container } = render(<Sidebar overlay>Content</Sidebar>);
    expect(container.querySelector('.sidebar-overlay-backdrop')).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onOverlayClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Sidebar overlay onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.click(container.querySelector('.sidebar-overlay-backdrop')!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onOverlayClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <Sidebar overlay onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onOverlayClose on Escape when not in overlay mode', () => {
    const onClose = vi.fn();
    render(
      <Sidebar onOverlayClose={onClose}>Content</Sidebar>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Sidebar overlay focus management', () => {
  it('moves focus to the first focusable element when overlay opens', () => {
    render(
      <Sidebar overlay>
        <Sidebar.Item>First</Sidebar.Item>
        <Sidebar.Item>Second</Sidebar.Item>
      </Sidebar>
    );
    // The first interactive item inside the sidebar should be focused
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /First/i }));
  });

  it('traps focus within the sidebar in overlay mode', () => {
    render(
      <Sidebar overlay>
        <Sidebar.Item>Only Item</Sidebar.Item>
      </Sidebar>
    );
    const btn = screen.getByRole('button', { name: /Only Item/i });
    btn.focus();
    // Tab past the last element should cycle back (sentinel redirects focus)
    // We verify the sentinel elements exist with tabIndex
    const sentinels = document.querySelectorAll('[aria-hidden="true"][tabindex="0"]');
    expect(sentinels.length).toBeGreaterThanOrEqual(2);
  });
});
