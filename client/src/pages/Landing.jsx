import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Add your resume',
    description: 'Upload a PDF and get skills and feedback extracted from its actual contents.',
  },
  {
    number: '02',
    title: 'Choose a role',
    description: 'Pick a listed role or enter your own to compare the skills you have with the skills to build.',
  },
  {
    number: '03',
    title: 'Check companies',
    description: 'Compare your profile with available examples, then see what to learn next.',
  },
];

const outputs = ['Resume feedback', 'Skill gaps', 'Company checks', 'Learning priorities'];

function Landing() {
  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] font-sans">
      <header className="border-b border-[#E4E1D8]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-sm font-semibold tracking-[0.12em] text-[#12181B]">
            NEXORA
          </Link>
          <nav aria-label="Account" className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#5B6670] hover:text-[#12181B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6F5C]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F6F5C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#185849] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6F5C]"
            >
              Get started
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-[#E4E1D8]">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-center lg:gap-20 lg:py-24">
            <div>
              <p className="mb-5 text-sm font-semibold text-[#1F6F5C]">Career planning, grounded in your resume</p>
              <h1 className="display-serif mb-6 max-w-3xl font-serif text-4xl font-medium leading-tight text-[#12181B] sm:text-5xl">
                See how ready your resume is for the role you want, and what to learn next.
              </h1>
              <p className="mb-8 max-w-2xl text-base leading-7 text-[#5B6670]">
                Upload a PDF, choose a role, and compare your skills with the requirements available in Nexora. Enter a company or role of your own for clearly labelled general guidance.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F6F5C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#185849] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6F5C]"
                >
                  Create your account
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-[#E4E1D8] bg-white px-5 py-3 text-sm font-semibold text-[#12181B] hover:bg-[#F2EFE9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6F5C]"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="border-t border-[#E4E1D8] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <h2 className="mb-5 text-base font-semibold text-[#12181B]">What you get</h2>
              <ul className="divide-y divide-[#E4E1D8] border-y border-[#E4E1D8]">
                {outputs.map((item) => (
                  <li key={item} className="flex items-center gap-3 py-3.5 text-sm text-[#12181B]">
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1F6F5C]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-5 text-[#5B6670]">
                Company criteria are approximate examples, not official company requirements.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="steps-title" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mb-9 max-w-2xl">
              <h2 id="steps-title" className="text-2xl font-semibold text-[#12181B] sm:text-3xl">
                From resume to next steps
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5B6670]">
                Your score and recommendations use your profile, extracted resume skills, and selected role.
              </p>
            </div>
            <ol className="grid gap-0 border-y border-[#E4E1D8] md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className={`py-6 md:pr-7 ${index > 0 ? 'border-t border-[#E4E1D8] md:border-l md:border-t-0 md:pl-7' : ''}`}
                >
                  <p className="mb-4 text-sm font-semibold text-[#1F6F5C]">{step.number}</p>
                  <h3 className="text-base font-semibold text-[#12181B]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6670]">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E4E1D8]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-[#5B6670] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold tracking-[0.12em] text-[#12181B]">NEXORA</span>
          <div className="flex items-center gap-5">
            <a href="https://github.com/anishagrawal25/Nexora" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#12181B]">
              GitHub
            </a>
            <span>© {new Date().getFullYear()} Nexora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
