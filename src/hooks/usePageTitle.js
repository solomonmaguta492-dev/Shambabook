import { useEffect } from 'react';

/*
  Sets the browser tab title, for example "Crops · ShambaBook".
  Screen readers also read the title when a new page opens.
*/
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ShambaBook` : 'ShambaBook';
  }, [title]);
}
