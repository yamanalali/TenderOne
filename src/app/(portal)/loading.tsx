export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-slate-200" />
      <div className="h-5 w-80 rounded-lg bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-3xl bg-slate-100" />
        <div className="h-40 rounded-3xl bg-slate-100" />
      </div>
      <div className="h-56 rounded-3xl bg-slate-100" />
    </div>
  );
}
