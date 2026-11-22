/*
  Hidden until it gets keyboard focus, then it appears at the top left.
  It lets keyboard users jump past the menu straight to the page content.
*/
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-lg bg-green-700 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
