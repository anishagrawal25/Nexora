import { Link, useLocation } from 'react-router-dom';

function AuthToggle() {
  const { pathname } = useLocation();

  return (
    <div className="flex gap-1 bg-[#EFECE2] rounded-lg p-1 mb-8 w-fit mx-auto">
      <Link
        to="/login"
        className={`px-5 py-2 rounded-md text-sm font-medium transition ${
          pathname === '/login' ? 'bg-white shadow-sm text-[#12181B]' : 'text-[#5B6670]'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`px-5 py-2 rounded-md text-sm font-medium transition ${
          pathname === '/register' ? 'bg-white shadow-sm text-[#12181B]' : 'text-[#5B6670]'
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}

export default AuthToggle;