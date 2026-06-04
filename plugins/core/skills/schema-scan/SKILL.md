---
name: schema-scan
description: Detects whether the target project is a monorepo or single-repo, identifies the package manager, and maps workspace structure.
input:
  project_path: absolute path to the target project root
output:
  is_monorepo: boolean
  package_manager: string — the detected package manager in kebab-case (e.g. npm, yarn, pnpm, bun, pip, poetry)
  workspaces: array of objects — each with { name, path, type }
  root_package_name: string | null — name field from root package.json if present
---

## What this skill does

Reads config and manifest files from `project_path` to determine whether the project contains multiple packages, which package manager is in use, and the list of workspace packages with their paths and types.

## How to execute this skill

This skill is fully self-contained and works standalone on any tool. Execute each detection step in order using whatever methods are available to you (file reading, command execution, etc.).

1. Execute each detection step below in order
2. For each step, follow the specific instructions (run commands or read files as you're able)
3. Collect the results into a single JSON object
4. Return the JSON object when complete

You can run this skill entirely on your own — no agent orchestration is required.
You can run this skill entirely on your own — no agent orchestration is required.

## Normalization rules

Apply to all output string values before returning:

- Lowercase everything
- Strip trailing residuals: `-runtime`, `-lang`, `-package`, `-manager`, `-tool`
- Replace spaces and underscores with hyphens
- `unknown` is reserved strictly for "genuinely could not determine" — never use it for a value that was detected but not in any example list

## Detection steps

### 1. Package manager

Check for lockfiles and config files. The following are common examples — detect any package manager you recognize:

| File | package_manager |
|---|---|
| `bun.lockb` | `bun` |
| `pnpm-lock.yaml` | `pnpm` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm` |
| `poetry.lock` or `pyproject.toml` | `poetry` |
| `requirements.txt` | `pip` |
| `composer.json` | `composer` |
| `go.mod` | `go-modules` |

First match wins.

### 2. Monorepo detection

A project is a monorepo if ANY of the following is true:

- `package.json` root has a `workspaces` field
- `pnpm-workspace.yaml` exists
- `nx.json` or `turbo.json` exists at root
- `lerna.json` exists at root
- Multiple `package.json` files exist more than one directory level deep

### 3. Workspace mapping

If monorepo, resolve workspace globs from `package.json#workspaces` or `pnpm-workspace.yaml#packages`. For each resolved path, read `package.json` to extract `name` and detect `type`.

Workspace type detection — check files inside each workspace path. The following are common examples — use your own knowledge to name any framework or tool you recognize:

| Signal | type |
|---|---|
| `next.config.*` | `nextjs` |
| `angular.json` | `angular` |
| `vite.config.*` + `vue` dep | `vue` |
| `vite.config.*` + `react` dep | `react` |
| `nest-cli.json` | `nestjs` |
| `manage.py` | `django` |
| `artisan` | `laravel` |

If a workspace uses a recognizable framework not in this list, name it accurately in kebab-case. Only use `unknown` if the workspace type is genuinely indeterminate.

If not a monorepo: `workspaces` is an empty array.

## Output format

```json
{
  "is_monorepo": true,
  "package_manager": "pnpm",
  "root_package_name": "my-project",
  "workspaces": [
    { "name": "web", "path": "apps/web", "type": "nextjs" },
    { "name": "api", "path": "apps/api", "type": "nestjs" },
    { "name": "ui", "path": "packages/ui", "type": "react" }
  ]
}
```

## Constraints

- Read-only. No writes, no network calls, no installs.
- Glob resolution must not follow symlinks outside `project_path`.
- If a workspace path exists on disk but has no `package.json`, still include it with `name: null`.
