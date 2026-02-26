# Workflow Templates

These are **template workflows** that do NOT run automatically.
They live outside `.github/workflows/` so GitHub Actions ignores them entirely.

To use one, copy it into `.github/workflows/` and customize it:

```bash
cp .github/workflow-templates/docker-build-push.yml .github/workflows/docker-build-push.yml
```

## Available Templates

| Template | Description |
|----------|-------------|
| `node-ci.yml` | Generic Node.js CI with matrix, caching, and artifacts |
| `docker-build-push.yml` | Build Docker image and push to GHCR or Docker Hub |
| `terraform-plan-apply.yml` | Terraform plan on PRs, apply on merge |
| `multi-platform-release.yml` | Cross-platform build + GitHub Release with checksums |
| `python-ci.yml` | Python CI with tox, multiple versions, and coverage |
