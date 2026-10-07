import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FBFAF6] flex flex-col justify-between font-sans selection:bg-[#EBF3F0] selection:text-[#1F6F5C]">
      {/* Minimal Top Header */}
      <header className="px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1F6F5C] flex items-center justify-center text-white shadow-xs group-hover:bg-[#185849] transition">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
            </div>
            <span className="font-mono text-xs tracking-widest font-semibold text-[#12181B] uppercase">
              NEXORA
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs text-[#5B6670] hover:text-[#12181B] transition font-medium"
          >
            ← Back to overview
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-6 px-6 border-t border-[#E4E1D8] text-center text-xs text-[#5B6670] font-mono">
        Nexora Career Readiness Platform • Secure Evaluation
      </footer>
    </div>
  );
}

export default AuthLayout;