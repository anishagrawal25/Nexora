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
        className="w-full border border-[#D8D5CA] rounded-lg px-3.5 py-2.5 pr-10 text-sm bg-[#FBFAF6] focus:outline-none focus:border-[#1F6F5C]"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B93A7] hover:text-[#5B6670]"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default PasswordInput;                                                                                      