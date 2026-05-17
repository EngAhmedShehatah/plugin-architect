---
name: tech-stack-detect
description: Reads package manifests and config files to produce a named list of all technologies and their versions used in the target project.
input:
  project_path: absolute path to the target project root (or a single workspace path)
output:
  techs: array of objects — each with { name, version, category, config_file }
---

## What this skill does

Reads manifest and config files from `project_path` and returns a flat list of every technology detected, with version and category. Does not run any install or build commands.

## Normalization rules

Apply to all `name` and `category` values before returning:

- Lowercase everything
- Strip trailing residuals: `-runtime`, `-lang`, `-package`, `-tool`, `-js`, `-ts`
- Replace spaces and underscores with hyphens
- `name` and `category` should reflect what the technology actually is — never fall back to a generic label just because it wasn't in an example list

## Detection steps

### 1. JavaScript / TypeScript projects

Read `package.json` from `dependencies` + `devDependencies`. The following are common examples — detect and name any package you recognize:

| Package | name | category |
|---|---|---|
| `next` | `nextjs` | `framework` |
| `react` | `react` | `framework` |
| `vue` | `vue` | `framework` |
| `@angular/core` | `angular` | `framework` |
| `@nestjs/core` | `nestjs` | `framework` |
| `express` | `express` | `framework` |
| `fastify` | `fastify` | `framework` |
| `typescript` | `typescript` | `language` |
| `vite` | `vite` | `build-tool` |
| `webpack` | `webpack` | `build-tool` |
| `tailwindcss` | `tailwind` | `styling` |
| `prisma` | `prisma` | `orm` |
| `drizzle-orm` | `drizzle` | `orm` |
| `typeorm` | `typeorm` | `orm` |
| `mongoose` | `mongoose` | `orm` |
| `@tanstack/react-query` | `react-query` | `data-fetching` |
| `graphql` | `graphql` | `api` |
| `jest` | `jest` | `testing` |
| `vitest` | `vitest` | `testing` |
| `playwright` | `playwright` | `testing` |
| `cypress` | `cypress` | `testing` |
| `eslint` | `eslint` | `tooling` |
| `prettier` | `prettier` | `tooling` |

For packages not in this list, detect the name from the package identifier and assign the most accurate `category` you can determine.

Version: use the resolved version string from `package.json`. Strip leading `^` `~`.

### 2. Config file signals

Check for these files regardless of `package.json` content. Common examples — detect any config-based technology you recognize:

| File | name | category |
|---|---|---|
| `docker-compose.yml` / `Dockerfile` | `docker` | `infra` |
| `.env` / `.env.example` | `dotenv` | `config` |
| `nx.json` | `nx` | `monorepo-tool` |
| `turbo.json` | `turborepo` | `monorepo-tool` |
| `lerna.json` | `lerna` | `monorepo-tool` |

### 3. Python projects

Read `pyproject.toml` or `requirements.txt`. Common examples:

| Package | name | category |
|---|---|---|
| `django` | `django` | `framework` |
| `fastapi` | `fastapi` | `framework` |
| `flask` | `flask` | `framework` |
| `sqlalchemy` | `sqlalchemy` | `orm` |
| `pytest` | `pytest` | `testing` |
| `celery` | `celery` | `queue` |

### 4. Go projects

Read `go.mod`. Extract the module path and Go version. Detect notable direct dependencies using the same approach as above.

### 5. PHP projects

Read `composer.json`. Detect frameworks, ORMs, and tooling using the same approach.

## Output format

```json
{
  "techs": [
    { "name": "nextjs", "version": "14.2.3", "category": "framework", "config_file": "package.json" },
    { "name": "typescript", "version": "5.4.5", "category": "language", "config_file": "package.json" },
    { "name": "tailwind", "version": "3.4.1", "category": "styling", "config_file": "tailwind.config.ts" },
    { "name": "prisma", "version": "5.13.0", "category": "orm", "config_file": "package.json" },
    { "name": "docker", "version": null, "category": "infra", "config_file": "Dockerfile" }
  ]
}
```

## Constraints

- Read-only. No network calls, no installs, no build execution.
- Deduplicate: if a tech is detected from both `package.json` and a config file, emit one entry using the config file as `config_file`.
- `version` is `null` when only detectable via config file presence with no version info.
- Do not infer techs from README or comments.
