"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PasswordModal from "@/components/auth/PasswordModal";
import type { Paper } from "@/types";

interface PaperDetailProps {
  paper: Paper;
}

export default function PaperDetail({ paper }: PaperDetailProps) {
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"edit" | "delete" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = () => {
    setPendingAction("edit");
    setShowPasswordModal(true);
  };

  const handleDeleteClick = () => {
    setPendingAction("delete");
    setShowPasswordModal(true);
  };

  const handlePasswordVerified = async (password: string) => {
    setShowPasswordModal(false);

    if (pendingAction === "edit") {
      router.push(`/papers/${paper.id}/edit?token=${encodeURIComponent(password)}`);
    } else if (pendingAction === "delete") {
      await handleDelete(password);
    }
    setPendingAction(null);
  };

  const handleDelete = async (password: string) => {
    if (!confirm("Are you sure you want to delete this paper? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/papers/${paper.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });

      if (res.ok) {
        router.push("/papers");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete paper");
      }
    } catch {
      alert("An error occurred while deleting the paper");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <article className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 sm:p-8">
        {/* Title and actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{paper.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleEditClick}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <dl className="space-y-4">
          <DetailRow label="Authors" value={paper.authors.join(", ")} />
          {paper.year && <DetailRow label="Year" value={String(paper.year)} />}
          {paper.journal && <DetailRow label="Journal" value={paper.journal} />}
          {paper.doi && <DetailRow label="DOI" value={paper.doi} />}
          {paper.volume && <DetailRow label="Volume" value={paper.volume} />}
          {paper.pages && <DetailRow label="Pages" value={paper.pages} />}
          {paper.url && (
            <div className="sm:grid sm:grid-cols-4 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">URL</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-3">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-500 underline break-all"
                >
                  {paper.url}
                </a>
              </dd>
            </div>
          )}

          {paper.abstract && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">Abstract</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {paper.abstract}
              </dd>
            </div>
          )}

          {paper.keywords && paper.keywords.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Keywords</dt>
              <dd className="flex flex-wrap gap-1.5">
                {paper.keywords.map((keyword) => (
                  <Badge key={keyword} text={keyword} />
                ))}
              </dd>
            </div>
          )}
        </dl>

        {/* Timestamps */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 text-xs text-gray-400">
          <span>Created: {formatDate(paper.createdAt)}</span>
          <span>Updated: {formatDate(paper.updatedAt)}</span>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
        }}
        onVerified={handlePasswordVerified}
      />
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:grid sm:grid-cols-4 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 sm:mt-0 sm:col-span-3 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
