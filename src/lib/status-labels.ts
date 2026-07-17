export const analysisStatusLabel: Record<string, string> = {
  queued: "في الانتظار",
  processing: "قيد التحليل",
  completed: "مكتمل",
  failed: "فشل",
};

export const analysisStatusColor: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  processing: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

export const paymentStatusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export const paymentStatusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};
