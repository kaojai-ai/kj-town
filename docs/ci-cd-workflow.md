# CI/CD workflow

This project uses GitHub Actions to keep pull requests small and to separate
prelive validation from production deployment.

## Development to prelive

1. Create a branch from `main`.
2. Make a focused change and push the branch.
3. Open a pull request into `main`.
4. The `Prelive Test` workflow runs on pull request open, synchronize, and
   reopen events.
5. The pull request must pass:
   - `pnpm run lint`
   - `pnpm test`

The prelive workflow currently validates the change with lint and tests. It
does not deploy the site.

## Production release

Production release is handled by the `Deploy Production` workflow.

It runs when code is pushed to `main`, or when someone starts it manually from
GitHub Actions. The workflow:

1. Installs dependencies with `pnpm install --frozen-lockfile`.
2. Runs `pnpm run lint`.
3. Runs `pnpm test`.
4. Builds the static site with `pnpm run build`.
5. Syncs the `dist` output to the configured S3 bucket.
6. Invalidates CloudFront for `/` and `/index.html` when a distribution ID is
   configured.

The deploy job uses the `production` GitHub environment, so production access
and approval rules should be managed there.

## Scheduled town upgrades

The `Upgrade Town With Codex` workflow runs every Tuesday at 04:30 UTC and can
also be started manually with an optional changelog date. It fetches the latest
KaoJai changelog, runs Codex with `instructions/upgrade-town.md`, builds the
project, runs lint and tests, then commits generated town updates when files
changed.

## Local checks before opening a PR

Run the same checks locally before pushing:

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm test
pnpm run build
```
