/**
 * PageStub
 * ---------------------------------------------------------
 * Placeholder réutilisable pour les pages pas encore développées.
 * Chaque page sera remplacée par son implémentation réelle au fur
 * et à mesure des phases (Upload -> Phase 6, Dashboard -> Phase 12,
 * History -> Phase 13, etc.).
 */
export default function PageStub({ title, description, phaseNote }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {phaseNote && (
        <p className="mt-6 text-xs text-slate-400">{phaseNote}</p>
      )}
    </div>
  );
}
