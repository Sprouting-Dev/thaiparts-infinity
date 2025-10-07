# Development Scripts Guide

## Root Level Commands

Run from the project root (`l:\Sprouting-Tech\thaiparts-infinity`):

### Development
```bash
npm run dev                    # Start both frontend + backend concurrently
npm run dev:frontend           # Start frontend only (Next.js on port 3000)
npm run dev:backend            # Start backend only (Strapi on port 1337)
```

### Build & Production
```bash
npm run build                  # Build both frontend + backend
npm run build:frontend         # Build frontend only
npm run build:backend          # Build backend only
```

### Code Quality & Linting
```bash
npm run check                  # Run type-check + lint + format:check for all
npm run fix                    # Auto-fix lint issues + format all code

# Type Checking
npm run type-check             # Check TypeScript types for both projects
npm run type-check:frontend    # Check frontend types only
npm run type-check:backend     # Check backend types only

# Code Formatting (Prettier)
npm run format                 # Format all code (frontend + backend)
npm run format:frontend        # Format frontend code only
npm run format:backend         # Format backend code only
npm run format:check           # Check if code needs formatting
npm run format:check:frontend  # Check frontend formatting only
npm run format:check:backend   # Check backend formatting only

# Linting (ESLint - Frontend only)
npm run lint                   # Run ESLint on frontend
npm run lint:frontend          # Same as above
npm run lint:fix               # Auto-fix ESLint issues
npm run lint:fix:frontend      # Same as above
```

## Frontend Specific Commands

Run from `frontend/` directory:

```bash
npm run dev                    # Next.js dev server (port 3000)
npm run build                  # Next.js production build
npm run start                  # Start production server
npm run lint                   # ESLint check
npm run lint:fix               # ESLint auto-fix
npm run type-check             # TypeScript type checking
npm run format                 # Prettier format
npm run format:check           # Prettier check
npm run check                  # Run type-check + lint + format:check
npm run fix                    # Run lint:fix + format
```

## Backend Specific Commands

Run from `backend/` directory:

```bash
npm run dev                    # Strapi dev server (port 1337)
npm run develop                # Same as dev
npm run build                  # Strapi production build
npm run start                  # Start production server
npm run type-check             # TypeScript type checking
npm run format                 # Prettier format
npm run format:check           # Prettier check
npm run check                  # Run type-check + format:check
npm run seed:example           # Seed database with example data
```

## Pre-commit Workflow

Before committing code, run:

```bash
npm run check                  # Check everything
# or
npm run fix                    # Auto-fix what can be fixed
npm run check                  # Verify everything is clean
```

## Configuration Files

- **Prettier**: `.prettierrc` + `.prettierignore` in both `frontend/` and `backend/`
- **ESLint**: `eslint.config.mjs` in `frontend/` only
- **TypeScript**: `tsconfig.json` in both projects