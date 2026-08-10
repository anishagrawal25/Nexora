import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import AuthToggle from '../components/AuthToggle';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
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
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#1F6F5C]" />
        <p className="font-mono text-xs tracking-widest text-[#1F6F5C] mb-1">SIGN IN</p>
        <h1 className="italic text-3xl text-[#12181B] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Welcome back.
        </h1>
        <p className="text-sm text-[#5B6670] mb-8">Pick up right where your readiness score left off.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5B6670] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@college.edu"
              className="w-full border border-[#D8D5CA] rounded-lg px-3.5 py-2.5 text-sm bg-[#FBFAF6] focus:outline-none focus:border-[#1F6F5C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5B6670] mb-1.5">Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F6F5C] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#195A4A] transition disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;