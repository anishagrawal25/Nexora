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
      <div className="bg-white border border-zinc-200 rounded-xl p-7 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Access your readiness scorecard and skill gap analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@college.edu"
              className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Password
            </label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white rounded-lg py-2.5 text-xs sm:text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
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