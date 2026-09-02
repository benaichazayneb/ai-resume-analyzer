import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="mt-6 inline-block text-sm text-slate-900 underline">
        Back to home
      </Link>
    </div>
  );
}
