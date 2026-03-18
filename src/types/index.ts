export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  keywords: string[] | null;
  url: string | null;
  year: number | null;
  journal: string | null;
  doi: string | null;
  volume: string | null;
  pages: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaperListResponse {
  papers: Paper[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface AuthVerifyResponse {
  verified: boolean;
}
