import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { apiRequest } from '../api';
import { validatePassword } from '../utils/validatePassword';
import AuthToggle from '../components/AuthToggle';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import { validateEmail } from '../utils/validateEmail';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checks = validatePassword(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!checks.isValid) {
      setError('Password does not meet the requirements below.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const rules = [
    { label: '8+ characters', met: checks.minLength },
    { label: '1 uppercase letter', met: checks.hasUpper },
    { label: '1 lowercase letter', met: checks.hasLower },
    { label: '1 number', met: checks.hasNumber },
    { label: '1 special symbol', met: checks.hasSpecial },
  ];

  return (
    <AuthLayout>
      <AuthToggle />
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-7 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="font-serif italic text-2xl font-medium text-[#12181B] tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-[#5B6670] mt-1">
            Get instant AI analysis and benchmark your placement readiness.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#12181B] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full bg-white border border-[#E4E1D8] text-[#12181B] placeholder:text-[#5B6670]/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15 transition"
            />
          </div>

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
            {password.length > 0 && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#F2EFE9] border border-[#E4E1D8]">
                <p className="text-[11px] font-medium text-[#5B6670] mb-1.5 font-mono uppercase tracking-wider">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {rules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`text-xs flex items-center gap-1.5 ${
                        rule.met ? 'text-[#1F6F5C] font-medium' : 'text-[#5B6670]/70'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${rule.met ? 'bg-[#EBF3F0] text-[#1F6F5C] font-bold' : 'bg-[#E4E1D8] text-[#5B6670]'}`}>
                        {rule.met ? '✓' : '•'}
                      </span>
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Register;