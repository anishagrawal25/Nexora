import { Link, useLocation } from 'react-router-dom';

function AuthToggle() {
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-2 bg-[#F2EFE9] p-1 rounded-xl border border-[#E4E1D8] mb-6 text-center">
      <Link
        to="/login"
        className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
          pathname === '/login'
            ? 'bg-white shadow-xs text-[#12181B] font-semibold'
            : 'text-[#5B6670] hover:text-[#12181B]'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
          pathname === '/register'
            ? 'bg-white shadow-xs text-[#12181B] font-semibold'
            : 'text-[#5B6670] hover:text-[#12181B]'
        }`}
      >
        Create account
      </Link>
    </div>
  );
}

export default AuthToggle;