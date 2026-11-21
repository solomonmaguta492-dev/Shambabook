import { Link } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 rounded-lg text-lg font-bold text-stone-900">
      <span aria-hidden="true" className="h-8 w-8 rounded-lg bg-green-700" />
      ShambaBook
    </Link>
  );
}

export default Logo;
