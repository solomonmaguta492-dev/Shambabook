/* Simple line icons drawn with SVG paths, keyed by name */
const paths = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  dashboard: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  crops: 'M12 21V11M12 11C12 7 9 5 5 5c0 4 3 6 7 6zM12 14c0-4 3-6 7-6 0 4-3 6-7 6z',
  expenses: 'M2 7h20v10H2zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  harvests: 'M3 10h18l-2 10H5zM8 10l4-6 4 6',
  weather:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  chart: 'M3 20h18M6 16v-5M11 16V7M16 16v-8M20 16V4',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6L6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  cloud: 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 18z',
  rain: 'M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 14zM8 17l-1 3M12 17l-1 3M16 17l-1 3',
  storm: 'M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 14zM13 14l-3 4h4l-3 4',
};

/*
  Without a label the icon is hidden from screen readers, because the text next to it says the same.
  With a label (for example "Rain") screen readers read it out like an image's alt text.
*/
function Icon({ name, className = 'h-6 w-6', label }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11y}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default Icon;
