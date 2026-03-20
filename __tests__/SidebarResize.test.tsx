import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';

describe('Sidebar resize', () => {
  it('renders resize handle when resizable', () => {
    const { container } = render(<Sidebar resizable>Content</Sidebar>);
    expect(container.querySelector('.sidebar-resize-handle')).toBeInTheDocument();
  });

  it('does not render resize handle when not resizable', () => {
    const { container } = render(<Sidebar>Content</Sidebar>);
    expect(container.querySelector('.sidebar-resize-handle')).not.toBeInTheDocument();
  });

  it('does not render resize handle when collapsed', () => {
    const { container } = render(
      <Sidebar resizable collapsible defaultCollapsed>
        Content
      </Sidebar>
    );
    expect(container.querySelector('.sidebar-resize-handle')).not.toBeInTheDocument();
  });

  it('resizes on pointer drag', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 300 });
    fireEvent.pointerUp(handle);

    expect(onWidthChange).toHaveBeenCalled();
  });

  it('clamps width to minWidth', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 100 });
    fireEvent.pointerUp(handle);

    const lastCall = onWidthChange.mock.calls[onWidthChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(200);
  });

  it('clamps width to maxWidth', () => {
    const onWidthChange = vi.fn();
    const { container } = render(
      <Sidebar resizable defaultWidth={260} minWidth={200} maxWidth={400} onWidthChange={onWidthChange}>
        Content
      </Sidebar>
    );
    const handle = container.querySelector('.sidebar-resize-handle')!;

    fireEvent.pointerDown(handle, { clientX: 260 });
    fireEvent.pointerMove(handle, { clientX: 600 });
    fireEvent.pointerUp(handle);

    const lastCall = onWidthChange.mock.calls[onWidthChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe(400);
  });
});
