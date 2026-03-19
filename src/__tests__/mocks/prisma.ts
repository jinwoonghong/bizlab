// Mock Prisma client for unit tests
import { vi } from "vitest";

export const prismaMock = {
  paper: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

// Mock the prisma module so all imports get the mock
vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));
