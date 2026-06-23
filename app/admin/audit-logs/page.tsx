"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Input, Button } from "@/components/ui";
import { getErrorMessage } from "@/lib/utils/error";

interface AuditLog {
  id: string;
  created_at: string;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const [actionFilter, setActionFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50"
      });
      if (actionFilter) params.append("action", actionFilter);
      if (emailFilter) params.append("actor_email", emailFilter);
      if (roleFilter) params.append("actor_role", roleFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      
      const data = await res.json();
      setLogs(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, emailFilter, roleFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-600 mt-1">Review system activity and security events ({totalCount} total)</p>
      </div>
      
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
             <Input label="Action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} placeholder="e.g. USER_LOGIN" />
          </div>
          <div className="w-48">
             <Input label="Actor Email" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} placeholder="Search email" />
          </div>
          <div className="w-32">
             <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
             <select className="w-full px-3 py-2 border rounded-md" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
             </select>
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" onClick={() => { setActionFilter(""); setEmailFilter(""); setRoleFilter(""); setPage(1); }}>Clear</Button>
        </form>
      </Card>
      
      <Card className="overflow-x-auto">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Context</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{log.actor_email || "System"}</div>
                    <div className="text-xs text-slate-500 capitalize">{log.actor_role}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.action}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{log.target_type} {log.target_id ? `(${log.target_id})` : ''}</div>
                    {log.target_label && <div className="text-xs text-slate-500">{log.target_label}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                    {log.ip_address && <div>IP: {log.ip_address}</div>}
                    {log.user_agent && <div className="truncate" title={log.user_agent}>UA: {log.user_agent}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="mt-4 flex justify-between items-center">
           <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant="outline">Previous</Button>
           <span className="text-sm text-slate-500">Page {page} of {totalPages || 1}</span>
           <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} variant="outline">Next</Button>
        </div>
      </Card>
    </div>
  );
}
