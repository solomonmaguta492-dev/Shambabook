import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../hooks/usePageTitle.js';

describe('usePageTitle', () => {
  it('sets the title with the app name after it', () => {
    renderHook(() => usePageTitle('Crops'));

    expect(document.title).toBe('Crops · ShambaBook');
  });

  it('updates the title when it changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), { initialProps: { title: 'Crop' } });

    rerender({ title: 'Maize' });

    expect(document.title).toBe('Maize · ShambaBook');
  });

  it('uses just the app name when there is no title', () => {
    renderHook(() => usePageTitle());

    expect(document.title).toBe('ShambaBook');
  });
});
