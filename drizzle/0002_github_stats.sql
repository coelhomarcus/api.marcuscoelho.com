CREATE TABLE "github_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_stars" integer NOT NULL,
	"merged_prs" integer NOT NULL,
	"closed_issues" integer NOT NULL,
	"current_streak" integer NOT NULL,
	"last_commit_date" text NOT NULL,
	"last_commit_repo" text NOT NULL,
	"languages" jsonb NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
