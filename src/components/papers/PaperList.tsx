"use client";

import { useRouter, useSearchParams } from "next/navigation";
import PaperCard from "./PaperCard";
import Pagination from "@/components/ui/Pagination";
import type { Paper } from "@/types";

interface PaperListProps {
  papers: Paper[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function PaperList({
  papers,
  currentPage,
  totalPages,
  total,
}: PaperListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/papers?${params.toString()}`);
  };

  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No papers found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        {total} paper{total !== 1 ? "s" : ""} found
      </p>
      <div className="grid gap-4">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
