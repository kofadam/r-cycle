#!/bin/bash
# Install Git Hooks for R-Cycle
# Run this script to set up pre-commit and commit-msg hooks

HOOK_DIR=".git/hooks"
SOURCE_DIR=".git-hooks"

echo "Installing R-Cycle Git Hooks..."

if [ ! -d "$HOOK_DIR" ]; then
  echo "Error: .git/hooks directory not found. Are you in the project root?"
  exit 1
fi

# Install pre-commit hook
if [ -f "$SOURCE_DIR/pre-commit.example" ]; then
  cp "$SOURCE_DIR/pre-commit.example" "$HOOK_DIR/pre-commit"
  chmod +x "$HOOK_DIR/pre-commit"
  echo "✓ Installed pre-commit hook"
else
  echo "⚠ pre-commit.example not found"
fi

# Install commit-msg hook
if [ -f "$SOURCE_DIR/commit-msg.example" ]; then
  cp "$SOURCE_DIR/commit-msg.example" "$HOOK_DIR/commit-msg"
  chmod +x "$HOOK_DIR/commit-msg"
  echo "✓ Installed commit-msg hook"
else
  echo "⚠ commit-msg.example not found"
fi

# Set commit template
git config commit.template .gitmessage
echo "✓ Set commit message template"

echo ""
echo "Git hooks installed successfully!"
echo ""
echo "To bypass hooks during commit, use:"
echo "  git commit --no-verify"
echo ""
