"use client";

import React from "react";
import { cn } from "~/lib/utils"; 
import { Loader2 } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "Nenhum item encontrado.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("bg-white rounded-xl p-6", className)}>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            )}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-6 py-2 whitespace-nowrap text-sm text-gray-700",
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : (row[col.key as keyof T] as any)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
