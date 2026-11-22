import { Outlet } from 'react-router-dom';
import Logo from '../Logo.jsx';
import Sidebar from '../Sidebar.jsx';
import BottomNav from '../BottomNav.jsx';
import SkipLink from '../SkipLink.jsx';

/* Frame for the logged-in app: sidebar on desktop, top bar and bottom tabs on phones */
function AppLayout() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 md:flex">
      <SkipLink />
      <Sidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-stone-300 bg-white px-4 py-3 md:hidden">
          <Logo />
        </header>

        {/*
          Extra bottom padding on phones so content is not hidden behind BottomNav.
          tabIndex -1 lets the skip link move focus here.
        */}
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 pt-6 pb-28 focus:outline-none md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export default AppLayout;
