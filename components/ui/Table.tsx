import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4.5 py-3.5 whitespace-nowrap ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`group transition-colors duration-150 ${
                  onRowClick ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4.5 py-3.5 text-slate-800 dark:text-slate-200 whitespace-nowrap ${column.className || ""}`}
                  >
                    {column.render
                      ? column.render(item)
                      : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
