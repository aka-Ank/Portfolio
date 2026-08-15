const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "octocat";

interface GitHubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
}

// Live GitHub activity via the public REST API — no auth token needed for
// public data, works for any public username. Defaults to GitHub's own
// "octocat" test account so the feature is genuinely demonstrable before a
// real username is configured (docs/08-roadmap.md Phase 4). Server-rendered
// so the visitor's browser never needs to make a cross-origin request and
// the response can be cached.
export async function GET() {
  try {
    const [userRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`, {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!userRes.ok) {
      return Response.json({ available: false, reason: "github-api-error" }, { status: 200 });
    }

    const user = await userRes.json();
    const events: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];

    const highlights = events
      .filter((e) => ["PushEvent", "PullRequestEvent", "CreateEvent"].includes(e.type))
      .slice(0, 5)
      .map((e) => ({
        type: e.type.replace("Event", ""),
        repo: e.repo.name,
        date: e.created_at,
      }));

    return Response.json({
      available: true,
      username: GITHUB_USERNAME,
      publicRepos: user.public_repos,
      followers: user.followers,
      profileUrl: user.html_url,
      highlights,
    });
  } catch {
    return Response.json({ available: false, reason: "network-error" }, { status: 200 });
  }
}
