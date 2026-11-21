import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-green-700 text-white hover:bg-green-800',
  secondary: 'border border-green-700 bg-white text-green-700 hover:bg-green-50',
};

/*
  A styled button. Pass "to" and it renders a router Link instead,
  so links can look like buttons too.
*/
function Button({
  variant = 'primary',
  type = 'button',
  onClick,
  to,
  className = '',
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
