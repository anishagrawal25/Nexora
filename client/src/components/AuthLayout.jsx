function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FBFAF6]">
      {/* Left: brand panel */}
      <div className="hidden md:flex flex-col items-center justify-center gap-6 bg-[#12181B] text-white p-12">
        <p className="font-mono text-xs tracking-[0.3em] text-[#9BC4B4]">NEXORA</p>
        <h2
          className="italic text-4xl text-center max-w-sm"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          One score. Every gap. What to learn next.
        </h2>
        <p className="text-sm text-[#B7BEC1] text-center max-w-xs">
          Upload your resume, pick a target role, and see exactly what's
          standing between you and your next offer.
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;