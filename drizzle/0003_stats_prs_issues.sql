ALTER TABLE "github_stats" DROP COLUMN IF EXISTS "followers";
ALTER TABLE "github_stats" ADD COLUMN IF NOT EXISTS "merged_prs" integer NOT NULL DEFAULT 0;
ALTER TABLE "github_stats" ADD COLUMN IF NOT EXISTS "closed_issues" integer NOT NULL DEFAULT 0;
