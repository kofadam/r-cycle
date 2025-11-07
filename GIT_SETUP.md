# Git Repository Setup

This guide helps you push HardwareHub to your organization's Git repository (GitHub, GitLab, Bitbucket, or internal Git server).

## Initial Repository Setup

### Option 1: GitHub

```bash
# On GitHub, create a new repository (don't initialize with README)
# Then push your existing repository:

cd hardware-marketplace

# Add remote
git remote add origin https://github.com/your-org/hardware-marketplace.git

# Push to GitHub
git push -u origin master

# Or if using 'main' as default branch:
git branch -M main
git push -u origin main
```

### Option 2: GitLab

```bash
# On GitLab, create a new project (blank project)
# Then push your existing repository:

cd hardware-marketplace

# Add remote
git remote add origin https://gitlab.com/your-org/hardware-marketplace.git

# Push to GitLab
git push -u origin master

# Or if using 'main':
git branch -M main
git push -u origin main
```

### Option 3: Internal Git Server

```bash
# For your organization's internal Git server:

cd hardware-marketplace

# Add remote (adjust URL to your server)
git remote add origin ssh://git@git.company.com/hardware-marketplace.git

# Push
git push -u origin master
```

## Repository Settings

### Protected Branches

Protect your main branches to prevent accidental force pushes:

**GitHub:**
- Settings → Branches → Add rule
- Branch name pattern: `main` or `master`
- Enable: Require pull request reviews before merging
- Enable: Require status checks to pass before merging

**GitLab:**
- Settings → Repository → Protected Branches
- Branch: `main` or `master`
- Allowed to merge: Maintainers
- Allowed to push: No one

### Branch Strategy

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Set develop as default branch for new work
```

Recommended branch structure:
- `main` - Production releases
- `develop` - Integration branch
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

## Repository Configuration

### Add Team Members

**GitHub:**
- Settings → Collaborators and teams
- Add team members with appropriate permissions

**GitLab:**
- Settings → Members
- Invite team members with roles

### Enable Issues

**GitHub:**
- Settings → Features → Issues ✓

**GitLab:**
- Settings → General → Visibility, project features → Issues ✓

### Setup CI/CD (Optional)

Create `.github/workflows/ci.yml` (GitHub) or `.gitlab-ci.yml` (GitLab) for automated testing and deployment.

## Repository Tags

Tag important milestones:

```bash
# Tag the POC version
git tag -a v0.1.0-poc -m "POC version for management demo"
git push origin v0.1.0-poc

# Future: Tag production releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

## README Badges (Optional)

Add badges to README.md for status indicators:

```markdown
![Build Status](https://github.com/your-org/hardware-marketplace/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-Internal-blue)
![Version](https://img.shields.io/badge/version-0.1.0--poc-green)
```

## Repository Structure Check

Verify all important files are tracked:

```bash
git ls-files
```

Should include:
- ✓ Source code (app/, components/, lib/)
- ✓ Configuration (package.json, tsconfig.json, etc.)
- ✓ Docker files (Dockerfile, docker-compose.yml)
- ✓ Documentation (*.md files)
- ✓ Scripts (scripts/)
- ✗ .env (ignored - correct!)
- ✗ node_modules/ (ignored - correct!)

## Clone Instructions for Team

Once pushed, your team can clone:

```bash
# Clone repository
git clone https://github.com/your-org/hardware-marketplace.git
cd hardware-marketplace

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start database
docker-compose up -d

# Setup database
npm run db:setup

# Start development
npm run dev
```

## Git Best Practices

### Before Committing

```bash
# Check what will be committed
git status

# Review changes
git diff

# Stage specific files
git add app/page.tsx

# Or stage all
git add .

# Commit with good message
git commit -m "feat(dashboard): add hardware expiration warnings"
```

### Before Pushing

```bash
# Make sure you're on the right branch
git branch

# Pull latest changes first
git pull

# Push your changes
git push
```

### Creating Pull Requests

```bash
# Create feature branch
git checkout -b feature/bulk-upload

# Make changes and commit
git add .
git commit -m "feat(listings): add bulk hardware upload"

# Push feature branch
git push -u origin feature/bulk-upload

# Create PR via web interface
```

## Repository Permissions

### Recommended Roles

**Maintainers** (Team Leads):
- Can merge to main/master
- Can manage settings
- Can approve PRs

**Developers**:
- Can create branches
- Can submit PRs
- Cannot merge to main/master

**Reviewers**:
- Can review and approve PRs
- Can comment on code

## Security

### Secrets Management

**Never commit:**
- Database passwords
- API keys
- JWT secrets
- Keycloak credentials

**Use:**
- Environment variables
- Secret management tools (Vault, etc.)
- GitHub Secrets (for CI/CD)

### .gitignore is Already Configured

The `.gitignore` file already excludes:
- node_modules/
- .env files
- Build artifacts
- IDE files

## Backup Strategy

### Local Backups

```bash
# Create backup of repository
git bundle create hardware-marketplace-backup.bundle --all

# Restore from backup
git clone hardware-marketplace-backup.bundle hardware-marketplace-restored
```

### Remote Backups

If using GitHub/GitLab, automatic backups are handled. For internal Git servers, coordinate with your IT team.

## Migration from Other Systems

### From ZIP file
Already done! Repository is initialized with first commit.

### From another Git repository

```bash
# Add old repository as remote
git remote add old-origin <old-repo-url>

# Fetch history
git fetch old-origin

# Merge history if needed
git merge old-origin/master --allow-unrelated-histories
```

## Next Steps

1. ✅ Push repository to your Git server
2. ✅ Configure branch protection
3. ✅ Add team members
4. ✅ Share clone instructions with team
5. ✅ Setup CI/CD (optional)

## Troubleshooting

### Authentication Issues

**HTTPS:**
```bash
# Use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/your-org/hardware-marketplace.git
```

**SSH:**
```bash
# Use SSH URL
git remote set-url origin git@github.com:your-org/hardware-marketplace.git
```

### Push Rejected

```bash
# Pull latest changes first
git pull --rebase origin master

# Resolve conflicts if any
# Then push
git push origin master
```

### Large Files

If you add large files by mistake:
```bash
# Remove from staging
git reset HEAD large-file.bin

# Add to .gitignore
echo "large-file.bin" >> .gitignore
```

## Repository Health

Check repository health periodically:

```bash
# Check for uncommitted changes
git status

# Check remote sync status
git fetch
git status

# View recent commits
git log --oneline -10

# Check repository size
du -sh .git
```

## Questions?

- **Git basics**: https://git-scm.com/doc
- **GitHub**: https://docs.github.com
- **GitLab**: https://docs.gitlab.com
- **Team lead**: Contact for repository access

---

**Your repository is ready to push!** The initial commit is already created with a comprehensive commit message. Just add your remote and push! 🚀
