import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import Footer from '../Footer.jsx';
import SkipLink from '../SkipLink.jsx';

/* Frame for public pages; the current page is drawn where <Outlet /> is */
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-stone-900">
      <SkipLink />
      <Navbar />
      {/* tabIndex -1 lets the skip link move focus here */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
