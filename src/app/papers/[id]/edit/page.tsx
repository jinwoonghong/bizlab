"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PaperForm from "@/components/papers/PaperForm";
import PasswordModal from "@/components/auth/PasswordModal";
import type { Paper } from "@/types";
import type { CreatePaperInput } from "@/lib/validations";

export default function EditPaperPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for password token from query param (passed from detail page)
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setAdminPassword(token);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    } else {
      setShowPasswordModal(true);
    }
  }, [searchParams]);

  // Fetch paper data
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await fetch(`/api/papers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPaper(data);
        } else {
          setError("Paper not found");
        }
      } catch {
        setError("Failed to load paper");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPaper();
  }, [id]);

  const handlePasswordVerified = (password: string) => {
    setAdminPassword(password);
    setShowPasswordModal(false);
  };

  const handleSubmit = async (data: CreatePaperInput) => {
    if (!adminPassword) {
      setShowPasswordModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/papers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/papers/${id}`);
      } else {
        const errData = await res.json();
        if (res.status === 401) {
          setAdminPassword(null);
          setShowPasswordModal(true);
          setError("Password expired or invalid. Please verify again.");
        } else {
          setError(errData.error || "Failed to update paper");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-72 mb-8" />
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!paper && !isFetching) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Paper Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">
          The paper could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Paper</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the paper details below.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {paper && adminPassword && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
          <PaperForm
            initialData={paper}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      )}

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          if (!adminPassword) {
            router.push(`/papers/${id}`);
          }
        }}
        onVerified={handlePasswordVerified}
      />
    </div>
  );
}
