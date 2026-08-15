const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME;

// LeetCode has no official public API. This calls the same GraphQL endpoint
// leetcode.com's own site uses client-side for public profile stats — no
// auth, widely used by the open-source "leetcode stats badge" community for
// exactly this purpose, but genuinely unofficial and can break without
// notice (see ENGINEER_NOTES.md). Fails closed to `available: false` rather
// than throwing, and there's no default placeholder username here (unlike
// GitHub's octocat) since there's no equivalent safe public demo account —
// the compact stats display simply doesn't render until a real username is
// configured.
const QUERY = `
  query userProblemsSolved($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export async function GET() {
  if (!LEETCODE_USERNAME) {
    return Response.json({ available: false, reason: "not-configured" }, { status: 200 });
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { username: LEETCODE_USERNAME } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return Response.json({ available: false, reason: "leetcode-api-error" }, { status: 200 });
    }

    const json = await res.json();
    const stats = json?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!stats) {
      return Response.json({ available: false, reason: "user-not-found" }, { status: 200 });
    }

    const byDifficulty = Object.fromEntries(
      stats.map((s: { difficulty: string; count: number }) => [s.difficulty, s.count]),
    );

    return Response.json({
      available: true,
      username: LEETCODE_USERNAME,
      total: byDifficulty.All ?? 0,
      easy: byDifficulty.Easy ?? 0,
      medium: byDifficulty.Medium ?? 0,
      hard: byDifficulty.Hard ?? 0,
    });
  } catch {
    return Response.json({ available: false, reason: "network-error" }, { status: 200 });
  }
}
