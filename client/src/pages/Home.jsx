import { Link } from "react-router-dom";

export default function Home() {
return ( <div className="min-h-screen bg-white text-[#111111]">

  {/* ================= NAVBAR ================= */}
  <header className="border-b border-gray-100">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
      
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D5DFB] text-sm font-bold text-white">
          T
        </div>

        <span className="text-xl font-semibold tracking-tight">
          TalentLink
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-gray-500 md:flex">
        <a href="#how-it-works" className="transition hover:text-[#111111]">
          How it works
        </a>

        <a href="#features" className="transition hover:text-[#111111]">
          Features
        </a>

        <a href="#ai" className="transition hover:text-[#111111]">
          AI Insights
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="hidden px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-[#111111] sm:block"
        >
          Sign in
        </Link>

        <Link
          to="/upload-resume"
          className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D5DFB]"
        >
          Get Started
        </Link>
      </div>
    </div>
  </header>

  {/* ================= HERO ================= */}
  <main>

    <section className="relative overflow-hidden">
      
      {/* Decorative background */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#6D5DFB]/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-2 lg:px-8 lg:pb-32 lg:pt-28">

        {/* LEFT */}
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#6D5DFB]" />
            AI-powered recruitment platform
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Recruit smarter.
            <span className="block text-[#6D5DFB]">
              Discover better talent.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-gray-500">
            TalentLink uses AI to analyze candidate profiles, match skills
            with opportunities and transform interviews into actionable
            insights.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/upload-resume"
              className="rounded-full bg-[#111111] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#6D5DFB]"
            >
              Get Started
              <span className="ml-2">→</span>
            </Link>

            <a
              href="#how-it-works"
              className="rounded-full border border-gray-200 px-7 py-3.5 text-sm font-medium text-gray-700 transition hover:border-gray-400"
            >
              Explore Platform
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-400">
            <span>✓ AI Matching</span>
            <span>✓ Smart Interviews</span>
            <span>✓ Candidate Insights</span>
          </div>
        </div>

        {/* RIGHT — AI VISUAL */}
        <div className="relative">
          <div className="rounded-[2rem] border border-gray-200 bg-[#F6F6F8] p-4 shadow-[0_30px_80px_rgba(17,17,17,0.08)]">

            {/* Window header */}
            <div className="flex items-center justify-between px-3 pb-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              </div>

              <span className="text-xs font-medium text-gray-400">
                TALENTLINK AI
              </span>
            </div>

            <div className="space-y-3">

              {/* Job */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Job opportunity
                    </p>
                    <h3 className="mt-1 font-semibold">
                      Full-Stack Developer
                    </h3>
                  </div>

                  <div className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium">
                    Internship
                  </div>
                </div>
              </div>

              {/* AI Match */}
              <div className="rounded-2xl bg-[#111111] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      AI Match
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      Candidate compatibility
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#6D5DFB] text-lg font-semibold">
                    87%
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full w-[87%] rounded-full bg-[#6D5DFB]" />
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Skill alignment
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "JavaScript",
                    "Node.js",
                    "React",
                    "MongoDB",
                    "Express",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#F6F6F8] px-3 py-1.5 text-xs font-medium text-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI insights */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      AI Insights
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      Strong technical alignment
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Strong match
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-xl sm:block">
            <p className="text-xs text-gray-400">
              Candidates analyzed
            </p>
            <p className="mt-1 text-xl font-semibold">
              1,284+
            </p>
          </div>

          <div className="absolute -right-5 top-20 hidden rounded-2xl bg-[#6D5DFB] px-5 py-4 text-white shadow-xl sm:block">
            <p className="text-xs text-white/70">
              AI precision
            </p>
            <p className="mt-1 text-xl font-semibold">
              94%
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ================= TRUST / INTRO ================= */}
    <section className="border-y border-gray-100 bg-[#F6F6F8]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">

          <div>
            <p className="text-3xl font-semibold tracking-tight">
              AI-first
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Move beyond keyword matching with intelligent candidate
              analysis.
            </p>
          </div>

          <div>
            <p className="text-3xl font-semibold tracking-tight">
              Data-driven
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Turn CVs, skills and interviews into structured insights.
            </p>
          </div>

          <div>
            <p className="text-3xl font-semibold tracking-tight">
              Candidate-first
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Give recruiters a clearer view of every candidate journey.
            </p>
          </div>

        </div>
      </div>
    </section>

    {/* ================= HOW IT WORKS ================= */}
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6D5DFB]">
          How it works
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          From profile to potential.
        </h2>

        <p className="mt-5 text-lg leading-8 text-gray-500">
          TalentLink connects the most important stages of modern
          recruitment in one intelligent workflow.
        </p>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-4">

        {[
          {
            number: "01",
            title: "Upload",
            description:
              "Upload a candidate CV and the job opportunity.",
          },
          {
            number: "02",
            title: "Analyze",
            description:
              "AI extracts skills, experience and relevant information.",
          },
          {
            number: "03",
            title: "Match",
            description:
              "Compare candidate capabilities with the requirements.",
          },
          {
            number: "04",
            title: "Interview",
            description:
              "Evaluate the candidate through an AI-assisted interview.",
          },
        ].map((item) => (
          <div
            key={item.number}
            className="group rounded-3xl border border-gray-200 p-7 transition hover:-translate-y-1 hover:border-[#6D5DFB]/40 hover:shadow-xl"
          >
            <span className="text-sm font-semibold text-[#6D5DFB]">
              {item.number}
            </span>

            <h3 className="mt-10 text-xl font-semibold">
              {item.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {item.description}
            </p>
          </div>
        ))}

      </div>
    </section>

    {/* ================= FEATURES ================= */}
    <section
      id="features"
      className="bg-[#111111] text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B7CFF]">
            One recruitment workspace
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Everything you need to understand talent.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6D5DFB] text-lg">
              AI
            </div>

            <h3 className="mt-8 text-xl font-semibold">
              Intelligent Matching
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Identify skill alignment, missing skills and candidate-job
              compatibility.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg">
              ◉
            </div>

            <h3 className="mt-8 text-xl font-semibold">
              AI Interviews
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Conduct structured interviews and transform answers into
              organized evaluation insights.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg">
              ↗
            </div>

            <h3 className="mt-8 text-xl font-semibold">
              Candidate Intelligence
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Bring technical, communication and relevance insights
              together in one candidate profile.
            </p>
          </div>

        </div>
      </div>
    </section>

    {/* ================= AI SECTION ================= */}
    <section
      id="ai"
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
    >
      <div className="grid items-center gap-16 lg:grid-cols-2">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6D5DFB]">
            Candidate Intelligence
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            See more than a CV.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
            TalentLink brings together resume analysis, skill matching,
            interviews and AI-generated insights to create a richer view
            of each candidate.
          </p>

          <Link
            to="/upload-resume"
            className="mt-8 inline-flex rounded-full bg-[#111111] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#6D5DFB]"
          >
            Analyze a candidate →
          </Link>
        </div>

        {/* Intelligence card */}
        <div className="rounded-[2rem] border border-gray-200 bg-[#F6F6F8] p-5">

          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Candidate Intelligence
                </p>

                <h3 className="mt-1 text-xl font-semibold">
                  Full-Stack Developer
                </h3>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-[#6D5DFB] text-2xl font-semibold">
                87
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">

              <div className="rounded-2xl bg-[#F6F6F8] p-4">
                <p className="text-xs text-gray-400">
                  Technical
                </p>
                <p className="mt-2 text-xl font-semibold">
                  84
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F6F8] p-4">
                <p className="text-xs text-gray-400">
                  Communication
                </p>
                <p className="mt-2 text-xl font-semibold">
                  78
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F6F8] p-4">
                <p className="text-xs text-gray-400">
                  Relevance
                </p>
                <p className="mt-2 text-xl font-semibold">
                  86
                </p>
              </div>

            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">

              <p className="text-xs uppercase tracking-wider text-gray-400">
                AI Summary
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Strong technical alignment with relevant full-stack
                experience and good skill coverage for this opportunity.
              </p>

            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
                Strong alignment
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600">
                Docker missing
              </span>
            </div>

          </div>
        </div>
      </div>
    </section>

    {/* ================= CTA ================= */}
    <section className="px-6 pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#6D5DFB] px-8 py-16 text-center text-white sm:px-16 lg:py-20">

        <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
          TalentLink
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Recruitment should reveal potential, not just keywords.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75">
          Analyze profiles, understand candidates and make every stage of
          recruitment more intelligent.
        </p>

        <Link
          to="/upload-resume"
          className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-gray-100"
        >
          Get Started →
        </Link>

      </div>
    </section>

  </main>

  {/* ================= FOOTER ================= */}
  <footer className="border-t border-gray-100">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6D5DFB] text-xs font-bold text-white">
          T
        </div>

        <span className="font-medium text-gray-700">
          TalentLink
        </span>
      </div>

      <p>
        AI-powered recruitment, from profile to potential.
      </p>

    </div>
  </footer>

</div>

);
}
