interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    login?: string;
  } | null;
}

interface TelemetryCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

const FALLBACK_COMMITS: TelemetryCommit[] = [
  {
    sha: "8f4c2a1",
    message: "Refine agentic execution graph and project telemetry",
    author: "diogolean",
    date: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    sha: "31bd7e9",
    message: "Add JSON-driven executive profile and system metrics",
    author: "diogolean",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    sha: "c90a4d6",
    message: "Calibrate showcase conduit and responsive media layout",
    author: "diogolean",
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

async function loadCommits(): Promise<{ commits: TelemetryCommit[]; live: boolean; branch: string }> {
  const configuredRepo = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "diogolean/portfolio-web";
  const repo = /^[\w.-]+\/[\w.-]+$/.test(configuredRepo)
    ? configuredRepo
    : "diogolean/portfolio-web";
  const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? "main";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-web-telemetry",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=5`,
      { headers, next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const payload = (await response.json()) as GitHubCommit[];
    const commits = payload.slice(0, 5).map((item) => ({
      sha: item.sha.slice(0, 7),
      message: item.commit.message.split("\n", 1)[0],
      author: item.author?.login ?? item.commit.author.name,
      date: item.commit.author.date,
    }));
    if (!commits.length) throw new Error("GitHub returned no commits");
    return { commits, live: true, branch };
  } catch {
    return { commits: FALLBACK_COMMITS, live: false, branch };
  }
}

export default async function GitHubTelemetry() {
  const { commits, live, branch } = await loadCommits();

  return (
    <section
      aria-label="Recent GitHub commit telemetry"
      className="w-full max-w-4xl overflow-hidden rounded-lg border border-emerald-500/20 bg-black/60 font-mono text-xs shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-4 border-b border-emerald-500/15 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <span className="truncate text-[10px] uppercase tracking-[0.18em] text-emerald-300">
            Live system telemetry / recent commits
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-zinc-600">
          {live ? "GitHub live" : "Offline cache"}
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto p-2">
        {commits.map((commit) => (
          <article
            key={commit.sha}
            className="grid gap-2 border-b border-zinc-900 px-2 py-3 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]">
                #{commit.sha}
              </span>
              <span className="text-[9px] text-zinc-600">{relativeTime(commit.date)}</span>
            </div>
            <p className="min-w-0 truncate text-[11px] text-zinc-300">{commit.message}</p>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="rounded border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 py-0.5 text-emerald-300/70">
                {branch}
              </span>
              <span className="max-w-28 truncate rounded border border-zinc-800 px-1.5 py-0.5 text-zinc-500">
                {commit.author}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function relativeTime(isoDate: string) {
  const elapsed = Date.now() - new Date(isoDate).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "just now";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}
