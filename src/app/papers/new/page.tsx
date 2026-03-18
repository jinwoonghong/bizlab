"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaperForm from "@/components/papers/PaperForm";
import type { CreatePaperInput } from "@/lib/validations";

export default function NewPaperPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreatePaperInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const paper = await res.json();
        router.push(`/papers/${paper.id}`);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to create paper");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Register New Paper</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new research paper to the collection.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
        <PaperForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
