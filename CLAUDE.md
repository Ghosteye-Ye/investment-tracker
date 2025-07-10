# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (includes TypeScript compilation)
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Dexie (IndexedDB wrapper) for client-side storage
- **Routing**: React Router v7 with file-based routing structure
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Core Data Model
The application tracks investment portfolios with a hierarchical structure:
```
Account → Asset → Transaction
```

- **Account**: Top-level container (stock/gold accounts) with settings
- **Asset**: Individual stocks/commodities within an account
- **Transaction**: Buy/sell operations with profit calculations

### Database Layer
- **Storage**: Dexie-based IndexedDB for persistent client-side data
- **Schema**: Single `accounts` table storing denormalized account objects
- **Operations**: CRUD operations via `hooks/useInvestmentDB.ts`
- **Export/Import**: JSON-based data backup/restore functionality

### Component Architecture
- **Card Components**: `account-card.tsx`, `asset-card.tsx`, `transaction-card.tsx` for displaying data
- **Modal Components**: Create/edit forms for accounts, assets, and transactions
- **UI Components**: shadcn/ui components in `/components/ui/`
- **Layout**: Simple wrapper layout with potential for header/footer

### Routing Structure
- `/` - Home page (account overview)
- `/account/:accountId` - Account detail page
- `/account/:accountId/settings` - Account settings
- `/asset/:accountId/:assetId` - Asset detail page

### Styling System
- **Design System**: Dark theme with glassmorphism effects
- **Color Palette**: Slate-based with semantic color tokens
- **Components**: Consistent styling using Tailwind classes
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first approach with responsive breakpoints

### Key Features
- **Multi-account Management**: Support for stock and gold investment accounts
- **Transaction Tracking**: Buy/sell operations with fee calculations
- **Profit Analysis**: Real-time profit/loss calculations and return percentages
- **Data Export**: JSON export/import for backup purposes
- **Responsive Design**: Mobile-friendly interface

### File Organization
- `/src/components/` - Reusable React components
- `/src/components/ui/` - shadcn/ui base components
- `/src/pages/` - Page components following route structure
- `/src/hooks/` - Custom React hooks and database operations
- `/src/lib/` - Utility functions and database configuration
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global CSS and Tailwind configuration

### Development Notes
- Uses path aliases (`@/`) for clean imports
- TypeScript strict mode enabled
- ESLint configured for React and TypeScript
- No testing framework currently configured
- Uses pnpm as package manager
- Vite for fast development and building