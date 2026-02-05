"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  filterKey?: (row: T) => string;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search",
  filterKey,
  pageSize = 8,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();
    return data.filter((row) =>
      (filterKey ? filterKey(row) : JSON.stringify(row)).toLowerCase().includes(lower)
    );
  }, [data, query, filterKey]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((col) => col.key === sortKey);
    if (!column?.sortValue) return filtered;
    const next = [...filtered].sort((a, b) => {
      const valueA = column.sortValue?.(a);
      const valueB = column.sortValue?.(b);
      if (typeof valueA === "number" && typeof valueB === "number") {
        return valueA - valueB;
      }
      return String(valueA).localeCompare(String(valueB));
    });
    return sortDirection === "asc" ? next : next.reverse();
  }, [columns, filtered, sortDirection, sortKey]);

  const pageCount = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          className="max-w-xs"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Page {page + 1} of {pageCount || 1}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
            disabled={page + 1 >= pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
          {columns.map((column) => (
              <TableHead key={column.key}>
                <button
                  type="button"
                  className="flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  onClick={() => {
                    if (!column.sortValue) return;
                    setPage(0);
                    setSortKey((prev) => {
                      if (prev === column.key) {
                        setSortDirection((direction) =>
                          direction === "asc" ? "desc" : "asc"
                        );
                        return prev;
                      }
                      setSortDirection("asc");
                      return column.key;
                    });
                  }}
                >
                  {column.header}
                  {sortKey === column.key && (
                    <span className="text-[10px]">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((row, index) => (
            <TableRow key={`${index}-${page}`}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No matching records.
        </div>
      )}
    </div>
  );
}
