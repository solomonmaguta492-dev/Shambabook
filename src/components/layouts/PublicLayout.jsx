import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import Footer from '../Footer.jsx';

/* Frame for public pages; the current page is drawn where <Outlet /> is */
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-100 text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
