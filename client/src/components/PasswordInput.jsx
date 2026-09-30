import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({ value, onChange, placeholder = '••••••••' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-lg px-3 py-2 pr-9 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
      >
        {visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
}

export default PasswordInput;
                                                                                      