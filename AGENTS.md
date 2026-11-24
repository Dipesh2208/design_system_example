<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Git Branching & Workflow Rules

## Environment Architecture & Protected Branches

The repository follows a 3-tier environment branching model:

- **`dev`** (`Local Testing & Integration`): Developers test features locally, and feature branches integrate here.
- **`beta`** (`Blue Environment`): Staging & pre-production verification environment.
- **`production`** (`Green Environment`): Live production release environment.

## Strict Branch Rules

1. **Never push directly to `dev`, `beta`, or `production`**:
   - Direct `git push origin dev`, `git push origin beta`, or `git push origin production` is strictly prohibited across all tools (Terminal, VS Code, GitHub Desktop, GitKraken).
   - Pushes to these protected branches are intercepted and rejected by the local git `pre-push` hook and server-side branch rules.
   - Deleting `dev`, `beta`, or `production` locally or remotely via any tool, script, or GitHub interface is strictly forbidden.

2. **Branching & Promotion Workflow (PR / MR Only)**:
   - **Step 1: Feature Development & Local Testing**
     Always branch off `dev` for any new task or bug fix:
     ```bash
     git checkout dev
     git pull origin dev
     git checkout -b <type>/<short-description>
     ```
     Branch naming conventions:
     - `feature/<name>` for new features
     - `fix/<name>` for bug fixes
     - `<username>-<task>` for individual work in progress
   - **Step 2: PR/MR to `dev`**
     Commit your changes, push your feature branch, and open a PR/MR targeting `dev`:
     ```bash
     git push -u origin <branch-name>
     ```
   - **Step 3: Promotion to `beta` (Blue Environment)**
     Once verified and tested on `dev`, open a PR/MR from `dev` into `beta`.
   - **Step 4: Promotion to `production` (Green Environment)**
     Once validated in the Blue environment (`beta`), open a PR/MR from `beta` into `production`.
