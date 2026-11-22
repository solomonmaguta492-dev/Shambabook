import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const links = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/crops', label: 'Crops', icon: 'crops' },
  { to: '/expenses', label: 'Expenses', icon: 'expenses' },
  { to: '/harvests', label: 'Harvests', icon: 'harvests' },
  { to: '/weather', label: 'Weather', icon: 'weather' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

function linkClasses({ isActive }) {
  const base = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium';
  return isActive ? `${base} text-green-700` : `${base} text-stone-600`;
}

/* Tab bar fixed to the bottom of the screen on phones */
function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-300 bg-white md:hidden"
    >
      <ul className="flex px-1">
        {links.map((link) => (
          <li key={link.to} className="flex flex-1">
            <NavLink to={link.to} className={linkClasses}>
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default BottomNav;
