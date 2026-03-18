"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface FilterValues {
  author: string;
  keyword: string;
  yearFrom: string;
  yearTo: string;
}

interface FilterPanelProps {
  defaultValues?: Partial<FilterValues>;
  onFilter: (filters: FilterValues) => void;
  onClear: () => void;
}

export default function FilterPanel({
  defaultValues,
  onFilter,
  onClear,
}: FilterPanelProps) {
  const [author, setAuthor] = useState(defaultValues?.author ?? "");
  const [keyword, setKeyword] = useState(defaultValues?.keyword ?? "");
  const [yearFrom, setYearFrom] = useState(defaultValues?.yearFrom ?? "");
  const [yearTo, setYearTo] = useState(defaultValues?.yearTo ?? "");
  const [isExpanded, setIsExpanded] = useState(
    !!(defaultValues?.author || defaultValues?.keyword || defaultValues?.yearFrom || defaultValues?.yearTo)
  );

  const handleApply = () => {
    onFilter({ author, keyword, yearFrom, yearTo });
  };

  const handleClear = () => {
    setAuthor("");
    setKeyword("");
    setYearFrom("");
    setYearTo("");
    onClear();
  };

  const hasFilters = author || keyword || yearFrom || yearTo;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
          {hasFilters && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
              !
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author"
              name="author"
              value={author}
              onChange={(e) => setAuthor((e.target as HTMLInputElement).value)}
              placeholder="Filter by author"
            />
            <Input
              label="Keyword"
              name="keyword"
              value={keyword}
              onChange={(e) => setKeyword((e.target as HTMLInputElement).value)}
              placeholder="Filter by keyword"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Year from"
              name="yearFrom"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom((e.target as HTMLInputElement).value)}
              placeholder="1900"
              min={1900}
              max={2100}
            />
            <Input
              label="Year to"
              name="yearTo"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo((e.target as HTMLInputElement).value)}
              placeholder="2100"
              min={1900}
              max={2100}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
