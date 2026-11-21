import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/crops', label: 'Crops', icon: 'crops' },
  { to: '/expenses', label: 'Expenses', icon: 'expenses' },
  { to: '/harvests', label: 'Harvests', icon: 'harvests' },
  { to: '/weather', label: 'Weather', icon: 'weather' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

/* NavLink passes isActive, so the current page's link can be highlighted */
function linkClasses({ isActive }) {
  const base = 'flex items-center gap-3 rounded-lg px-3 py-2 font-medium';
  return isActive
    ? `${base} bg-green-50 text-green-700`
    : `${base} text-stone-600 hover:bg-stone-100 hover:text-stone-900`;
}

/* Side menu for the app, only shown on medium screens and up */
function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  /* Log out with Firebase, then go back to the landing page */
  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-300 bg-white p-4 md:flex">
      <div className="px-3 py-2">
        <Logo />
      </div>

      <nav aria-label="Main" className="mt-6 flex-1">
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClasses}>
                <Icon name={link.icon} className="h-5 w-5" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      >
        <Icon name="logout" className="h-5 w-5" />
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
