import { Link, useLocation } from 'react-router-dom';

function AuthToggle() {
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200/80 mb-6 text-center">
      <Link
        to="/login"
        className={`py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
          pathname === '/login'
            ? 'bg-white shadow-xs text-zinc-900 font-semibold'
            : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
          pathname === '/register'
            ? 'bg-white shadow-xs text-zinc-900 font-semibold'
            : 'text-zinc-500 hover:text-zinc-900'
        }`}
      >
        Create account
      </Link>
    </div>
  );
}

export default AuthToggle;