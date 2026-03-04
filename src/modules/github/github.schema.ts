import {
  pgTable,
  serial,
  integer,
  jsonb,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const githubContributions = pgTable("github_contributions", {
  id: serial("id").primaryKey(),
  totalContributions: integer("total_contributions").notNull(),
  weeks: jsonb("weeks").notNull(),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});

export const githubStats = pgTable("github_stats", {
  id: serial("id").primaryKey(),
  totalStars: integer("total_stars").notNull(),
  mergedPRs: integer("merged_prs").notNull(),
  closedIssues: integer("closed_issues").notNull(),
  currentStreak: integer("current_streak").notNull(),
  lastCommitDate: text("last_commit_date").notNull(),
  lastCommitRepo: text("last_commit_repo").notNull(),
  languages: jsonb("languages").notNull(),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});
