import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900">
        Analyze your CV. Match it with job opportunities.
      </h1>
      <p className="max-w-lg text-slate-500">
        Upload your resume, paste a job description, and get an instant match
        score powered by NLP and generative AI.
      </p>
      <Link
        to="/upload-resume"
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Analyze my resume
      </Link>
    </div>
  );
}
