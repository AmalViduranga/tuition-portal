import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      <h2 className="text-xl font-semibold text-slate-700">Loading Admin Dashboard...</h2>
      <p className="text-sm text-slate-500">Retrieving system data and metrics.</p>
    </div>
  );
}
