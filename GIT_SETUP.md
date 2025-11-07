# Git Setup Guide for R-Cycle

Quick reference for git workflow and setup.

## Initial Setup

```bash
# Clone and enter directory
git clone <your-repo-url>
cd r-cycle

# Configure your identity
git config user.name "Your Name"
git config user.email "your.email@company.com"

# Install git hooks
./install-hooks.sh
```

## Daily Workflow

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit
# (Template will guide you)

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub/GitLab
```

## Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes  
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `chore/` - Maintenance

## Commit Format

```
type(scope): subject

body

footer
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(api): add bulk hardware upload

Allows CSV upload with validation.

Closes #42
```

## Useful Commands

```bash
# View status
git status

# View commit history
git log --oneline --graph

# Update your branch
git checkout main && git pull
git checkout your-branch && git rebase main

# Undo last commit (not pushed)
git reset --soft HEAD~1

# Bypass hooks (use sparingly)
git commit --no-verify
```

## Getting Help

- Full guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Team chat for questions
- Open issues for bugs/features

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Book](https://git-scm.com/book/en/v2)
