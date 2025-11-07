# Contributing to R-Cycle

## Git Workflow

### Branch Naming Convention

Use the following prefixes for branch names:
- `feature/` - New features (e.g., `feature/servicenow-integration`)
- `fix/` - Bug fixes (e.g., `fix/storage-blocking-edge-case`)
- `docs/` - Documentation updates (e.g., `docs/update-deployment-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/api-error-handling`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Format

We use conventional commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(listings): add bulk upload capability

Allows users to upload CSV files with multiple hardware listings.
Validates each row and provides detailed error reporting.

Closes #42
```

```
fix(api): prevent duplicate claim submissions

Added transaction handling to prevent race condition where
multiple claims could be submitted simultaneously for the
same listing.

Fixes #67
```

### Development Workflow

1. **Create a branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add comments for complex logic

3. **Commit your changes**
   ```bash
   git add .
   git commit
   # Use the template to write a good commit message
   ```

4. **Keep your branch updated**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main
   ```

5. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide clear description of changes
   - Link to related issues
   - Request review from team members

### Pull Request Guidelines

**Before submitting:**
- [ ] Code follows project style
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts with main

**PR Description should include:**
- What problem does this solve?
- How does it solve it?
- What testing was done?
- Any breaking changes?
- Screenshots (if UI changes)

## Questions?

Open an issue or reach out to the team!
