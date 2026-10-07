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
        className="w-full bg-white border border-[#E4E1D8] text-[#12181B] placeholder:text-[#5B6670]/60 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-normal shadow-xs focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15 transition"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5B6670] hover:text-[#12181B] transition cursor-pointer"
      >
        {visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
}

export default PasswordInput;
                                                                                      