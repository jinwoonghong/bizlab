"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import PaperList from "@/components/papers/PaperList";
import type { Paper } from "@/types";

interface PapersPageClientProps {
  papers: Paper[];
  currentPage: number;
  totalPages: number;
  total: number;
  initialSearch: string;
  initialFilters: {
    author: string;
    keyword: string;
    yearFrom: string;
    yearTo: string;
  };
}

export default function PapersPageClient({
  papers,
  currentPage,
  totalPages,
  total,
  initialSearch,
  initialFilters,
}: PapersPageClientProps) {
  const router = useRouter();

  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = {
      search: initialSearch,
      author: initialFilters.author,
      keyword: initialFilters.keyword,
      yearFrom: initialFilters.yearFrom,
      yearTo: initialFilters.yearTo,
      ...overrides,
    };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    // Reset to page 1 on new search/filter
    if (!overrides.page) params.delete("page");
    return `/papers?${params.toString()}`;
  };

  const handleSearch = (query: string) => {
    router.push(buildUrl({ search: query }));
  };

  const handleFilter = (filters: {
    author: string;
    keyword: string;
    yearFrom: string;
    yearTo: string;
  }) => {
    router.push(buildUrl(filters));
  };

  const handleClearFilters = () => {
    router.push(buildUrl({ author: "", keyword: "", yearFrom: "", yearTo: "" }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Research Papers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and search the paper collection.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <SearchBar defaultValue={initialSearch} onSearch={handleSearch} />
        <FilterPanel
          defaultValues={initialFilters}
          onFilter={handleFilter}
          onClear={handleClearFilters}
        />
      </div>

      <Suspense fallback={<PaperListSkeleton />}>
        <PaperList
          papers={papers}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </div>
  );
}

function PaperListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-5 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
}
