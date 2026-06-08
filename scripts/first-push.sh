#!/usr/bin/env bash
# =====================================================================
# Ghimtech — first push to GitHub
#
# Run this ONCE from the unzipped project directory on your machine.
# It will:
#   1. Verify you have git + Node available
#   2. Confirm .env.local is NOT going to be committed
#   3. Initialize git, set the remote to durga710/GhimTech
#   4. Stage + commit + push
#
# Pre-req: you've already run `cp .env.example .env.local` and (optionally)
# filled it in. The .env.local file is gitignored and will NOT be pushed.
# =====================================================================

set -e

echo ""
echo "  ┌──────────────────────────────────────────────┐"
echo "  │   Ghimtech → github.com/durga710/GhimTech    │"
echo "  └──────────────────────────────────────────────┘"
echo ""

# --- 1. Sanity checks -------------------------------------------------
command -v git  >/dev/null 2>&1 || { echo "✗ git not installed"; exit 1; }
command -v node >/dev/null 2>&1 || echo "  ⚠ node not installed yet — install Node 20+ before running 'npm install'"

# Make sure we're in the project root
if [ ! -f "package.json" ] || [ ! -d "src" ] || [ ! -d "prisma" ]; then
  echo "✗ Run this from the project root (the folder with package.json)"
  exit 1
fi

# Defense check: make sure .env.local will NOT be committed
if [ -f ".env.local" ]; then
  if git check-ignore .env.local >/dev/null 2>&1; then
    echo "✓ .env.local is gitignored (secrets stay local)"
  else
    echo "✗ DANGER: .env.local exists and is NOT gitignored. Aborting."
    echo "   Check your .gitignore before continuing."
    exit 1
  fi
fi

# --- 2. Init repo -----------------------------------------------------
if [ ! -d ".git" ]; then
  git init -b main
  echo "✓ git initialized on branch 'main'"
else
  echo "✓ git repo already initialized"
fi

# Set remote if not set
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin https://github.com/durga710/GhimTech.git
  echo "✓ origin → github.com/durga710/GhimTech"
else
  echo "✓ origin already configured: $(git remote get-url origin)"
fi

# --- 3. Stage + commit ------------------------------------------------
git add -A

# Show what's going up (truncated)
echo ""
echo "  Files staged:"
git diff --cached --name-only | head -20 | sed 's/^/    /'
echo "    ..."
TOTAL=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo "  Total: $TOTAL files"
echo ""

# Confirm
read -p "  Commit and push to origin/main? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "  Aborted. Nothing pushed."
  exit 0
fi

git commit -m "Ghimtech v1 — founder OS + brand system + Phase 5 infrastructure

Phases shipped:
- Phase 1: Design system, layout shell, landing page
- Phase 2: About + Experience timeline
- Phase 3: Projects (RayHealthEVV deep-dive) + Contact
- Phase 4: Supabase Auth + Dashboard widgets
- Phase 5: Real DB (Prisma+Supabase), 11 API endpoints,
  audit logging, rate limiting, single-operator security
- Brand: canonical mark + lockup + wordmark, applied site-wide" || echo "(nothing new to commit)"

# --- 4. Push ----------------------------------------------------------
echo ""
echo "  Pushing to origin/main..."
git push -u origin main

echo ""
echo "  ✓ Pushed."
echo ""
echo "  Next steps:"
echo "    1. Visit https://github.com/durga710/GhimTech to confirm"
echo "    2. cp .env.example .env.local"
echo "    3. Fill Supabase Auth + database values"
echo "    4. npm install"
echo "    5. npm run db:push"
echo "    6. npm run dev -> sign up -> grab Supabase Auth user id"
echo "    7. SEED_AUTH_USER_ID=uuid npm run db:seed"
echo "    8. Deploy to Vercel, point ghimtech.org at it"
echo ""
