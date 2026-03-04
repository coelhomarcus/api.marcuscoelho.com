CREATE TABLE "github_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_contributions" integer NOT NULL,
	"weeks" jsonb NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
