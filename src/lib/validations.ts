import { z } from "zod";

export const createPaperSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  authors: z.array(z.string().min(1)).min(1, "At least one author is required"),
  abstract: z.string().max(5000).optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
  url: z.string().url("Invalid URL format").optional().nullable().or(z.literal("")),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  journal: z.string().max(200).optional().nullable(),
  doi: z.string().max(200).optional().nullable(),
  volume: z.string().max(50).optional().nullable(),
  pages: z.string().max(50).optional().nullable(),
});

export const updatePaperSchema = createPaperSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  author: z.string().optional(),
  keyword: z.string().optional(),
  yearFrom: z.coerce.number().int().min(1900).optional(),
  yearTo: z.coerce.number().int().max(2100).optional(),
  sort: z.enum(["createdAt", "year", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
