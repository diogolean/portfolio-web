import "server-only";

import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

export interface LocalGitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface LocalGitLog {
  commits: LocalGitCommit[];
  branch: string;
  repoPath: string;
}

export function readEngineGitLog(limit = 5): LocalGitLog | null {
  const repoPath = process.env.GIT_REPO_PATH || "C:\\dev\\omni-engine";
  if (!existsSync(join(repoPath, ".git"))) return null;

  try {
    const count = Math.min(20, Math.max(1, limit));
    const output = execFileSync(
      "git",
      [
        "log",
        "-n",
        String(count),
        "--pretty=format:%h%x1f%s%x1f%an%x1f%aI%x1e",
      ],
      { cwd: repoPath, encoding: "utf8", windowsHide: true }
    );
    const commits = output
      .split("\x1e")
      .map((record) => record.trim())
      .filter(Boolean)
      .map((record) => {
        const [sha, message, author, date] = record.split("\x1f");
        return { sha, message, author, date };
      })
      .filter((commit) => commit.sha && commit.message && commit.date);
    if (!commits.length) return null;

    const branch =
      execFileSync("git", ["branch", "--show-current"], {
        cwd: repoPath,
        encoding: "utf8",
        windowsHide: true,
      }).trim() || "HEAD";

    return { commits, branch, repoPath };
  } catch {
    return null;
  }
}
