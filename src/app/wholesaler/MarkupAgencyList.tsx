'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface ApiMarkupEntry {
  provider: string;
  type: string;
  value: number;
  _id: string;
}

interface ApiMarkupPlan {
  _id: string;
  name: string;
  service: string;
  createdBy: string;
  markups: ApiMarkupEntry[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiAgencyItem {
  _id: string;
  agencyName: string;
  markupPlan: ApiMarkupPlan;
}

// --- MAIN COMPONENT ---
export default function MarkupAgencyList() {
  const [data, setData] = useState<ApiAgencyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const planId = '6846c22c950f46d1e1a7de42';
  const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')}/markup/plan/${planId}/agencies`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch data');
        setData(json.data);
      } catch (err: any) {
        console.error('Fetch Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  // --- TABLE COLUMNS ---
  const columns = useMemo(
    () => [
      {
        accessorKey: 'agencyName',
        header: 'Agency Name',
        cell: ({ row }: any) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.agencyName}
          </div>
        ),
      },
      {
        accessorKey: 'markupPlan.name',
        header: 'Plan Name',
        cell: ({ row }: any) => row.original.markupPlan.name,
      },
      {
        accessorKey: 'markupPlan.service',
        header: 'Service',
        cell: ({ row }: any) => row.original.markupPlan.service,
      },
      {
        accessorKey: 'markupPlan.markups',
        header: 'Markup',
        cell: ({ row }: any) => {
          const markups = row.original.markupPlan.markups;
          if (markups.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">N/A</span>;
          }
          return (
            <span className="px-3 py-1 text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {markups[0].value}%
            </span>
          );
        },
      },
      {
        accessorKey: 'markupPlan.isActive',
        header: 'Status',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                row.original.markupPlan.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>{row.original.markupPlan.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'markupPlan.updatedAt',
        header: 'Last Updated',
        cell: ({ row }: any) =>
          new Date(row.original.markupPlan.updatedAt).toLocaleDateString(),
      },
    ],
    []
  );

  // --- TABLE INSTANCE ---
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <svg
          className="animate-spin h-16 w-16 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg" role="alert">
           <strong className="font-bold">Error:</strong>
           <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agency Markup Plans</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            A comprehensive list of all agencies associated with the markup plan.
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* --- Search Input --- */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search all agencies..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* --- Table --- */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col" className="px-6 py-3">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUp size={16} />,
                            desc: <ChevronDown size={16} />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-gray-500 dark:text-gray-400">
                      No agencies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

   
        </div>
      </div>
    </div>
  );
}