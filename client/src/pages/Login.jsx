import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '../api';
import AuthToggle from '../components/AuthToggle';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { validateEmail } from '../utils/validateEmail';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthToggle />
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-7 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#12181B]">
            Sign In
          </h1>
          <p className="text-xs text-[#5B6670] mt-1">
            Open your resume feedback, role gaps, and company checks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#12181B] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@college.edu"
              className="w-full bg-white border border-[#E4E1D8] text-[#12181B] placeholder:text-[#5B6670]/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12181B] mb-1.5">
              Password
            </label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F6F5C] text-white rounded-xl py-2.5 text-xs sm:text-sm font-medium hover:bg-[#185849] active:bg-[#14493D] transition disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;