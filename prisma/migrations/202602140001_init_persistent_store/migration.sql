CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Project" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "workflowState" JSONB,
  "interviewState" JSONB,
  "outlinesState" JSONB,
  "lockedOutline" JSONB,
  "draftState" JSONB,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Source" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "abstract" TEXT NOT NULL,
  "sectionKey" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "selected" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Source_projectId_idx" ON "Source" ("projectId");

ALTER TABLE "Source"
  ADD CONSTRAINT "Source_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
