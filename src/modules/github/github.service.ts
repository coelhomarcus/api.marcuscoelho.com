import { db } from "../../config/database";
import { env } from "../../config/env";
import { githubContributions, githubStats } from "./github.schema";
import { desc } from "drizzle-orm";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_USERNAME = "coelhomarcus";

const CONTRIBUTIONS_QUERY = `
  query {
    user(login: "${GITHUB_USERNAME}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const STATS_QUERY = `
  query {
    user(login: "${GITHUB_USERNAME}") {
      pullRequests(states: MERGED) {
        totalCount
      }
      issues(states: CLOSED) {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes {
          name
          isPrivate
          stargazerCount
          pushedAt
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

function calculateStreak(
  weeks: { contributionDays: { date: string; contributionCount: number }[] }[],
): number {
  const allDays = weeks
    .flatMap((w) => w.contributionDays)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  let streak = 0;
  let expectedDate = new Date(today + "T12:00:00");

  // If today has no contributions yet, start checking from yesterday
  const firstDay = allDays[0];
  if (firstDay && firstDay.date === today && firstDay.contributionCount === 0) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  for (const day of allDays) {
    const dayDate = new Date(day.date + "T12:00:00");
    const expected = expectedDate.toISOString().split("T")[0];

    if (day.date > expected) continue;
    if (day.date < expected) break;

    if (day.contributionCount > 0) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function refreshGitHubContributions() {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as any;
  const calendar = json.data.user.contributionsCollection.contributionCalendar;

  await db.insert(githubContributions).values({
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
  });

  console.log(
    `[GitHub] Contributions cache atualizado: ${calendar.totalContributions} contribuições`,
  );

  return calendar;
}

export async function refreshGitHubStats() {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: STATS_QUERY }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as any;
  const user = json.data.user;

  // Total stars
  const totalStars = user.repositories.nodes.reduce(
    (acc: number, repo: any) => acc + repo.stargazerCount,
    0,
  );

  // PRs & Issues
  const mergedPRs = user.pullRequests.totalCount;
  const closedIssues = user.issues.totalCount;

  // Last commit (most recently pushed repo)
  const lastRepo = user.repositories.nodes[0];
  const lastCommitDate = lastRepo?.pushedAt ?? new Date().toISOString();
  const lastCommitRepo = lastRepo?.isPrivate ? "" : (lastRepo?.name ?? "");

  // Languages aggregated by size
  const langMap = new Map<string, { size: number; color: string }>();
  for (const repo of user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      const existing = langMap.get(name);
      if (existing) {
        existing.size += edge.size;
      } else {
        langMap.set(name, {
          size: edge.size,
          color: edge.node.color ?? "#8b8b8b",
        });
      }
    }
  }

  const totalSize = Array.from(langMap.values()).reduce(
    (a, b) => a + b.size,
    0,
  );
  const languages = Array.from(langMap.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 8)
    .map(([name, { size, color }]) => ({
      name,
      percentage: Math.round((size / totalSize) * 1000) / 10,
      color,
    }));

  // Streak
  const calendarWeeks = user.contributionsCollection.contributionCalendar.weeks;
  const currentStreak = calculateStreak(calendarWeeks);

  const stats = {
    totalStars,
    mergedPRs,
    closedIssues,
    currentStreak,
    lastCommitDate,
    lastCommitRepo,
    languages,
  };

  await db.insert(githubStats).values(stats);

  console.log(
    `[GitHub] Stats cache atualizado: ${totalStars} stars, ${mergedPRs} PRs, ${closedIssues} issues, ${currentStreak} streak`,
  );

  return stats;
}

export async function getCachedContributions() {
  const [latest] = await db
    .select()
    .from(githubContributions)
    .orderBy(desc(githubContributions.id))
    .limit(1);

  return latest ?? null;
}

export async function getCachedStats() {
  const [latest] = await db
    .select()
    .from(githubStats)
    .orderBy(desc(githubStats.id))
    .limit(1);

  return latest ?? null;
}
