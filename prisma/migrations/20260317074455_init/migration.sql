-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "abstract" TEXT,
    "keywords" TEXT,
    "url" TEXT,
    "year" INTEGER,
    "journal" TEXT,
    "doi" TEXT,
    "volume" TEXT,
    "pages" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
