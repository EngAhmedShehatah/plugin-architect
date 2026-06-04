---
name: git-detect
description: Detects git remote URL, branch strategy, and CI provider from the target project's git config and CI files.
input:
  project_path: absolute path to the target project root
output:
  remote_url: string — the origin remote URL, or "none" if no remote exists
  host: string — the git hosting provider in kebab-case (e.g. github, gitlab, bitbucket, azure)
  branch_model: string — the detected branching strategy in kebab-case (e.g. gitflow, trunk, github-flow)
  ci_provider: string — the detected CI/CD provider in kebab-case (e.g. github-actions, gitlab-ci, circleci)
  default_branch: string — the default branch name (e.g. main, master, develop)
---

## What this skill does

Reads git configuration and CI files from `project_path` to identify where the repository is hosted, what branching strategy is in use, and which CI/CD provider is configured.

## How to execute this skill

This skill is fully self-contained and works standalone on any tool. You have access to Bash and Read tools.

1. Execute each detection step below in order
2. For each step, follow the specific command or file-reading instructions
3. Collect the results into a single JSON object
4. Return the JSON object when complete

You can run this skill entirely on your own — no agent orchestration is required.

## Normalization rules

Apply to all output string values before returning:

- Lowercase everything
- Strip trailing residuals: `-runtime`, `-lang`, `-package`, `-tool`, `-ci`, `-cd`
- Replace spaces and underscores with hyphens
- `unknown` is reserved strictly for "genuinely could not determine" — never use it for a value that was detected but not in any example list

## Detection steps

### 1. Remote URL

Run `git -C <project_path> remote get-url origin`.
Parse the host from the URL and normalize it. The following are common examples — use your own knowledge for anything not listed:

| URL pattern | host |
|---|---|
| `github.com` | `github` |
| `gitlab.com` | `gitlab` |
| `bitbucket.org` | `bitbucket` |
| `dev.azure.com` | `azure` |

If no remote exists: `remote_url: none`, `host: unknown`.

### 2. Default branch

Run `git -C <project_path> symbolic-ref refs/remotes/origin/HEAD --short` and strip the `origin/` prefix.
Fallback: `git config init.defaultBranch`. If still unresolvable, use `main`.

### 3. Branch model

Inspect branch names via `git -C <project_path> branch -a`. Use your understanding of branching strategies — common examples:

| Signal | branch_model |
|---|---|
| `develop` + `release/*` or `hotfix/*` branches present | `gitflow` |
| All work merges directly to `main`/`master`, no long-lived branches | `trunk` |
| Feature branches merge to `main` via PRs, no `develop` | `github-flow` |

If a recognizable strategy is detected that doesn't match these examples, name it accurately in kebab-case.

### 4. CI provider

Check for CI config files under `project_path`. Common examples — detect any CI system you recognize:

| File / folder | ci_provider |
|---|---|
| `.github/workflows/*.yml` | `github-actions` |
| `.gitlab-ci.yml` | `gitlab-ci` |
| `.circleci/config.yml` | `circleci` |
| `bitbucket-pipelines.yml` | `bitbucket-pipelines` |
| `Jenkinsfile` | `jenkins` |
| `azure-pipelines.yml` | `azure-pipelines` |

First match wins. No CI config found → `none`.

## Output format

```json
{
  "remote_url": "https://github.com/org/repo",
  "host": "github",
  "branch_model": "github-flow",
  "ci_provider": "github-actions",
  "default_branch": "main"
}
```

## Constraints

- Read-only. No writes, no network calls.
- Must not fail if `project_path` is not a git repo — return `remote_url: none`, others `unknown`.
- Do not infer from README or documentation files.
