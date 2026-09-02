import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>

      <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <p className="text-xs text-slate-500">Name</p>
          <p className="text-sm text-slate-900">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm text-slate-900">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-4 text-sm text-red-600 hover:underline"
      >
        Log out
      </button>
    </div>
  );
}
