import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { validatePassword } from '../utils/validatePassword';
import AuthToggle from '../components/AuthToggle';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

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
    { label: 'At least 8 characters', met: checks.minLength },
    { label: 'One uppercase letter', met: checks.hasUpper },
    { label: 'One lowercase letter', met: checks.hasLower },
    { label: 'One number', met: checks.hasNumber },
    { label: 'One special character (@$!%*#?&)', met: checks.hasSpecial },
  ];

  return (
    <AuthLayout>
      <AuthToggle />
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#1F6F5C]" />
        <p className="font-mono text-xs tracking-widest text-[#1F6F5C] mb-1">GET STARTED</p>
        <h1 className="italic text-3xl text-[#12181B] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Let's find your gaps.
        </h1>
        <p className="text-sm text-[#5B6670] mb-8">Takes two minutes. No course to buy, no card needed.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5B6670] mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Anisha Agrawal"
              className="w-full border border-[#D8D5CA] rounded-lg px-3.5 py-2.5 text-sm bg-[#FBFAF6] focus:outline-none focus:border-[#1F6F5C]"
            />
          </div>
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
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {rules.map((rule) => (
                  <li
                    key={rule.label}
                    className={`text-xs flex items-center gap-1.5 ${
                      rule.met ? 'text-[#1F6F5C]' : 'text-[#8B93A7]'
                    }`}
                  >
                    <span>{rule.met ? '✓' : '·'}</span> {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F6F5C] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#195A4A] transition disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Register;