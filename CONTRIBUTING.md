# Contributing to HardwareHub

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git
- PostgreSQL (via Docker)

### Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd hardware-marketplace

# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Setup database
npm run db:setup

# Start development server
npm run dev
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature

```bash
# Create feature branch from develop
git checkout develop
git pull
git checkout -b feature/your-feature-name

# Make your changes
# ... code ...

# Commit with descriptive message
git add .
git commit -m "feat: add hardware bulk upload functionality"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request to develop
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, tooling

### Examples

```bash
feat(listings): add bulk hardware upload
fix(auth): resolve Keycloak token refresh issue
docs(readme): update deployment instructions
refactor(api): optimize database query performance
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Export interfaces from `lib/types.ts`

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### API Routes
- Validate all inputs
- Use proper HTTP status codes
- Return consistent error format:
  ```typescript
  { error: 'Error message', details?: any }
  ```

### Database
- Use parameterized queries (never string concatenation)
- Add indexes for commonly queried fields
- Document schema changes in migration files

## File Organization

```
app/
├── api/              # API routes
│   ├── listings/     # Hardware CRUD
│   ├── claims/       # Request management
│   └── hardware/     # Serial lookup
├── page.tsx          # Dashboard
├── post/             # Post hardware
├── my-listings/      # Manage listings
└── my-requests/      # Track requests

components/
└── Sidebar.tsx       # Shared components

lib/
├── db.ts             # Database utilities
├── auth.ts           # Authentication
├── hardware-api.ts   # Hardware API integration
└── types.ts          # TypeScript definitions

scripts/
└── setup-db.js       # Database setup
```

## Testing

### Running Tests

```bash
# Unit tests (when implemented)
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Test error cases and edge cases
- Mock external dependencies (API calls, database)

## Database Changes

### Creating a Migration

```bash
# Create migration file
touch scripts/migration-XXX-description.sql
```

Example migration:
```sql
-- Migration: Add department limits
-- Date: 2024-01-15

ALTER TABLE listings 
ADD COLUMN max_claims INTEGER DEFAULT 1;

CREATE INDEX idx_listings_max_claims ON listings(max_claims);
```

### Running Migrations

```bash
# Connect to database
psql $DATABASE_URL

# Run migration
\i scripts/migration-XXX-description.sql
```

## Integration Points

### Adding Keycloak OIDC

1. Install next-auth:
   ```bash
   npm install next-auth
   ```

2. Create `app/api/auth/[...nextauth]/route.ts`

3. Update `lib/auth.ts` to use sessions

4. See README.md for detailed guide

### Connecting Real Hardware API

1. Update `lib/hardware-api.ts`
2. Replace `fetchHardwareSpecs()` function
3. Add authentication headers
4. Handle API errors appropriately

### ServiceNow Integration

1. Add ServiceNow client library
2. Create approval ticket on claim creation
3. Update status when ServiceNow ticket updates
4. See DEPLOYMENT.md for workflow details

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] No merge conflicts with target branch

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings
```

## Code Review Guidelines

### As a Reviewer
- Be constructive and respectful
- Test the changes locally
- Check for security implications
- Verify documentation is updated
- Approve only when satisfied

### As an Author
- Respond to all comments
- Make requested changes promptly
- Ask for clarification when needed
- Update PR description if scope changes

## Environment Variables

### Required for Development

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hardware_marketplace
NODE_ENV=development
```

### Required for Production

```bash
DATABASE_URL=postgresql://user:pass@host:5432/hardware_marketplace
KEYCLOAK_ISSUER=https://keycloak.company.com/realms/your-realm
KEYCLOAK_CLIENT_ID=hardware-marketplace
KEYCLOAK_CLIENT_SECRET=your-secret
NEXTAUTH_URL=https://hardware.company.com
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

## Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
npm run db:setup
```

### Add New API Route
1. Create `app/api/your-route/route.ts`
2. Export GET/POST/PUT/DELETE handlers
3. Add validation and error handling
4. Update types in `lib/types.ts`

### Add New Page
1. Create `app/your-page/page.tsx`
2. Add navigation link in `components/Sidebar.tsx`
3. Follow existing page patterns

### Update Database Schema
1. Create migration file in `scripts/`
2. Update `scripts/setup-db.js`
3. Run migration on all environments
4. Update TypeScript types

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs hardware-marketplace-db

# Restart database
docker-compose restart
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- **Technical Questions**: Check README.md and code comments
- **Integration Help**: See DEPLOYMENT.md
- **Architecture**: See OVERVIEW.md
- **Team Lead**: Contact your team lead for guidance

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter

# Database
npm run db:setup        # Setup schema and sample data
psql $DATABASE_URL      # Connect to database

# Docker
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs     # View logs

# Git
git status              # Check status
git log --oneline       # View commit history
git branch -a           # List all branches
```

## Security Considerations

### When Adding Features
- Validate all user inputs
- Never trust client-side data
- Use parameterized database queries
- Check authorization for all operations
- Log security-relevant events

### Storage Media Policy
- Never bypass storage media blocking
- Storage devices must go through secure decommission
- This is a technical control, not just policy

### Sensitive Data
- Never commit credentials to git
- Use environment variables
- Don't log sensitive information
- Sanitize error messages shown to users

## Documentation

### When to Update Docs
- New features: Update README.md
- API changes: Update code comments
- Deployment changes: Update DEPLOYMENT.md
- User-facing changes: Update QUICKSTART.md

### Documentation Style
- Clear and concise
- Include code examples
- Use proper markdown formatting
- Keep docs up to date with code

## Questions?

If you have questions not covered here:
1. Check existing documentation
2. Ask your team lead
3. Review similar code in the project
4. Propose documentation improvements

## License

Internal organizational use only.

---

**Thank you for contributing to HardwareHub!** 🚀
