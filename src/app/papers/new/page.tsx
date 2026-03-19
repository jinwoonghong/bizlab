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
        setError(errData.error || "논문 등록에 실패했습니다");
      }
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 논문 등록</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 연구 논문을 컬렉션에 추가하세요.
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
