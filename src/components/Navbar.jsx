import { useState } from 'react';
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

/* Top bar for public pages; links collapse into a menu on small screens */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="border-b border-stone-300 bg-white">
      <nav aria-label="Main" className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="hidden items-center gap-3 md:flex">
            <Button to="/login" variant="secondary">
              Log in
            </Button>
            <Button to="/register">Sign up</Button>
          </div>

          <button
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2.5 text-stone-900 hover:bg-stone-100 md:hidden"
          >
            <Icon name={isOpen ? 'close' : 'menu'} />
          </button>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="flex flex-col gap-3 pb-4 md:hidden">
            <Button to="/login" variant="secondary" onClick={closeMenu}>
              Log in
            </Button>
            <Button to="/register" onClick={closeMenu}>
              Sign up
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
