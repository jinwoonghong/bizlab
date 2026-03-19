"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import type { Paper } from "@/types";
import type { CreatePaperInput } from "@/lib/validations";

interface PaperFormProps {
  initialData?: Paper;
  onSubmit: (data: CreatePaperInput) => Promise<void>;
  isLoading?: boolean;
}

export default function PaperForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PaperFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [authors, setAuthors] = useState<string[]>(
    initialData?.authors ?? [""]
  );
  const [abstract, setAbstract] = useState(initialData?.abstract ?? "");
  const [keywords, setKeywords] = useState<string[]>(
    initialData?.keywords ?? []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [year, setYear] = useState(initialData?.year?.toString() ?? "");
  const [journal, setJournal] = useState(initialData?.journal ?? "");
  const [doi, setDoi] = useState(initialData?.doi ?? "");
  const [volume, setVolume] = useState(initialData?.volume ?? "");
  const [pages, setPages] = useState(initialData?.pages ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAuthorChange = (index: number, value: string) => {
    const updated = [...authors];
    updated[index] = value;
    setAuthors(updated);
  };

  const addAuthor = () => setAuthors([...authors, ""]);

  const removeAuthor = (index: number) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted && pasted.match(/^https?:\/\/.+/)) {
      // Let the input update first, then trigger fetch
      setTimeout(() => fetchMetadataFromUrl(pasted), 100);
    }
  };

  const fetchMetadataFromUrl = async (targetUrl: string) => {
    setIsFetching(true);
    setFetchMessage(null);
    try {
      const res = await fetch("/api/papers/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchMessage({ type: "error", text: data.error || "메타데이터를 가져오지 못했습니다." });
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.authors?.length) setAuthors(data.authors);
      if (data.abstract) setAbstract(data.abstract);
      if (data.year) setYear(String(data.year));
      if (data.journal) setJournal(data.journal);
      if (data.doi) setDoi(data.doi);
      setFetchMessage({ type: "success", text: "메타데이터를 성공적으로 불러왔습니다!" });
    } catch {
      setFetchMessage({ type: "error", text: "네트워크 오류입니다. 다시 시도해주세요." });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchMetadata = async () => {
    if (!url.trim()) {
      setFetchMessage({ type: "error", text: "먼저 URL을 입력해주세요." });
      return;
    }
    setIsFetching(true);
    setFetchMessage(null);
    try {
      const res = await fetch("/api/papers/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchMessage({ type: "error", text: data.error || "메타데이터를 가져오지 못했습니다." });
        return;
      }
      if (data.title) setTitle(data.title);
      if (data.authors?.length) setAuthors(data.authors);
      if (data.abstract) setAbstract(data.abstract);
      if (data.year) setYear(String(data.year));
      if (data.journal) setJournal(data.journal);
      if (data.doi) setDoi(data.doi);
      setFetchMessage({ type: "success", text: "메타데이터를 성공적으로 불러왔습니다!" });
    } catch {
      setFetchMessage({ type: "error", text: "네트워크 오류입니다. 다시 시도해주세요." });
    } finally {
      setIsFetching(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "제목을 입력해주세요";
    const validAuthors = authors.filter((a) => a.trim());
    if (validAuthors.length === 0)
      errs.authors = "저자를 한 명 이상 입력해주세요";
    if (url && !url.match(/^https?:\/\/.+/)) errs.url = "올바르지 않은 URL 형식입니다";
    if (year && (isNaN(Number(year)) || Number(year) < 1900 || Number(year) > 2100))
      errs.year = "출판연도는 1900~2100 사이여야 합니다";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validAuthors = authors.filter((a) => a.trim());
    const data: CreatePaperInput = {
      title: title.trim(),
      authors: validAuthors,
      abstract: abstract.trim() || null,
      keywords: keywords.length > 0 ? keywords : null,
      url: url.trim() || null,
      year: year ? Number(year) : null,
      journal: journal.trim() || null,
      doi: doi.trim() || null,
      volume: volume.trim() || null,
      pages: pages.trim() || null,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="제목 *"
        name="title"
        value={title}
        onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
        error={errors.title}
        placeholder="논문 제목을 입력하세요"
      />

      {/* Authors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          저자 *
        </label>
        {authors.map((author, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              name={`author-${index}`}
              value={author}
              onChange={(e) =>
                handleAuthorChange(index, (e.target as HTMLInputElement).value)
              }
              placeholder={`저자 ${index + 1}`}
            />
            {authors.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => removeAuthor(index)}
                aria-label={`Remove author ${index + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        ))}
        {errors.authors && (
          <p className="mt-1 text-sm text-red-600">{errors.authors}</p>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={addAuthor}>
          + 저자 추가
        </Button>
      </div>

      {/* Abstract */}
      <Input
        as="textarea"
        label="초록"
        name="abstract"
        value={abstract}
        onChange={(e) => setAbstract((e.target as HTMLTextAreaElement).value)}
        rows={4}
        placeholder="논문 초록을 입력하세요"
      />

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          키워드
        </label>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                text={keyword}
                removable
                onRemove={() => removeKeyword(keyword)}
              />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            name="keyword-input"
            value={keywordInput}
            onChange={(e) =>
              setKeywordInput((e.target as HTMLInputElement).value)
            }
            onKeyDown={handleKeywordKeyDown}
            placeholder="키워드를 입력하고 Enter를 누르세요"
          />
          <Button type="button" variant="secondary" size="md" onClick={addKeyword}>
            추가
          </Button>
        </div>
      </div>

      {/* URL with fetch metadata */}
      <div>
        <Input
          label="URL"
          name="url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl((e.target as HTMLInputElement).value);
            setFetchMessage(null);
          }}
          onPaste={handleUrlPaste}
          error={errors.url}
          placeholder="논문 URL을 붙여넣으면 자동으로 메타데이터를 가져옵니다"
        />
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchMetadata}
            isLoading={isFetching}
            disabled={!url.trim()}
          >
            URL에서 메타데이터 가져오기
          </Button>
          {fetchMessage && (
            <span className={`text-sm ${fetchMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {fetchMessage.text}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          학술지 사이트, Google Scholar, DOI, arXiv 등 대부분의 논문 URL을 지원합니다. 붙여넣으면 자동으로 메타데이터를 가져옵니다.
        </p>
      </div>

      {/* Year and Journal row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="출판연도"
          name="year"
          type="number"
          value={year}
          onChange={(e) => setYear((e.target as HTMLInputElement).value)}
          error={errors.year}
          placeholder="2024"
          min={1900}
          max={2100}
        />
        <Input
          label="학술지"
          name="journal"
          value={journal}
          onChange={(e) => setJournal((e.target as HTMLInputElement).value)}
          placeholder="학술지명"
        />
      </div>

      {/* DOI */}
      <Input
        label="DOI"
        name="doi"
        value={doi}
        onChange={(e) => setDoi((e.target as HTMLInputElement).value)}
        placeholder="10.xxxx/xxxxx"
      />

      {/* Volume and Pages row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="권"
          name="volume"
          value={volume}
          onChange={(e) => setVolume((e.target as HTMLInputElement).value)}
        />
        <Input
          label="페이지"
          name="pages"
          value={pages}
          onChange={(e) => setPages((e.target as HTMLInputElement).value)}
          placeholder="예: 1-15"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "논문 수정" : "논문 등록"}
        </Button>
      </div>
    </form>
  );
}
