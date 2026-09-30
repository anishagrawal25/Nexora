import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-zinc-200">
      {/* Minimal Top Header */}
      <header className="px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white shadow-xs group-hover:bg-zinc-800 transition">
              <Sparkles className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-mono text-xs tracking-widest font-semibold text-zinc-900 uppercase">
              NEXORA
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition font-medium"
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
      <footer className="py-6 px-6 border-t border-zinc-200 text-center text-xs text-zinc-400 font-mono">
        Nexora Career Readiness Platform • Secure Evaluation
      </footer>
    </div>
  );
}

export default AuthLayout;