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
- **Routing**: React Router v7
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Core Data Model
The application tracks investment portfolios with a hierarchical structure:
```
Account → Asset → Transaction
```

**Account** (types/investment.ts):
- Top-level container for stock or gold accounts
- Contains `settings` object with per-unit fee structure:
  - `buyFeePerUnit` / `sellFeePerUnit` - Fee per share/gram
  - `minBuyFee` / `minSellFee` - Minimum fee thresholds
  - `expandSubTransactions` - UI preference for transaction display
  - `currency` - Display currency ($ for stock, ¥ for gold)
- Each account contains multiple assets

**Asset**:
- Individual stocks or commodities within an account
- Has `name` and `symbol` fields
- Contains array of transactions

**Transaction**:
- Tracks buy operations (required: buyDate, buyQuantity, buyPrice)
- Optionally tracks sell operations (sellDate, sellQuantity, sellPrice)
- Fee fields: `buyFee` and `sellFee` calculated based on account settings
- Supports partial sells via `parentId` field for sub-transactions
- Auto-calculates `profit` on sell

### Architecture & Code Organization

**Services Layer** (`src/services/`):
- `feeService.ts` - Fee calculation logic (buy, sell, proportional)
- `calculationService.ts` - Statistics calculations (profit, return, holdings)
- `transactionService.ts` - Transaction business logic (create, update, delete)

**Configuration** (`src/config/`):
- `defaults.ts` - Default settings for stock/gold accounts and constants

**Custom Hooks** (`src/hooks/`):
- `useAccountData.ts` - Unified account data management with loading states
- `useInvestmentDB.ts` - Database CRUD operations

**Shared Components** (`src/components/shared/`):
- `StatCard.tsx` - Reusable statistics card with trend indicators
- `EmptyState.tsx` - Empty state placeholder with action button

### Database Layer
- **Storage**: Dexie-based IndexedDB (`lib/db.ts`)
- **Schema**: Single `accounts` table with string IDs
- **Data Structure**: Fully denormalized - entire account tree stored as one object
- **Operations**: All CRUD functions in `hooks/useInvestmentDB.ts`:
  - `getAllAccounts()` / `getAccountById(id)`
  - `addAccount(account)` / `updateAccount(account)` / `deleteAccount(id)`
  - `exportAccounts()` / `importAccounts(json)` - JSON backup/restore
- **State Management**: Local useState in pages, updates via `useAccountData` hook

### Routing & Navigation
Routes defined in `src/routes/index.tsx`:
- `/` - Home page (all accounts overview with stats)
- `/account/:accountId` - Account detail (all assets in account)
- `/account/:accountId/settings` - Account settings editor (accessible from account page header)
- `/asset/:accountId/:assetId` - Asset detail (all transactions)

Navigation uses React Router's `useNavigate()` and `useParams()` hooks.

### Component Patterns

**Page Components** (`src/pages/`):
- Use `useAccountData` hook for data loading
- Manage local state with `useState`
- Use services for business logic
- Use shared components (StatCard, EmptyState) for consistency
- All lists sorted by `createdAt` in descending order (newest first)

**Card Components**:
- Display entities with stats using calculation services
- Accept callbacks for actions
- Use currency from account settings (no hardcoding)
- Navigate to detail pages on click

**Modal Components**:
- Form-based creation/editing dialogs
- Use React Hook Form + Zod for validation
- Controlled via `isOpen` / `onClose` / `onSubmit` props

### Fee Calculation System
Fee calculation logic in `services/feeService.ts`:
```typescript
// Buy fee: max(quantity * buyFeePerUnit, minBuyFee)
buyFee = Math.max(quantity * settings.buyFeePerUnit, settings.minBuyFee)

// Sell fee: max(quantity * sellFeePerUnit, minSellFee)
sellFee = Math.max(quantity * settings.sellFeePerUnit, settings.minSellFee)
```

Profit calculation accounts for proportional fee allocation on partial sells.

### Styling System
- **Theme**: Dark theme with glassmorphism (`bg-slate-800/50 backdrop-blur-sm`)
- **Color Palette**: Slate base with semantic colors (green for profit, red for loss)
- **Gradients**: `from-purple-500 to-blue-500` for CTAs
- **Typography**: Chinese language UI (投资记录助手)
- **Responsive**: Grid layouts with `md:` and `lg:` breakpoints

### Path Aliases
`vite.config.ts` defines `@/` → `./src/` alias for clean imports.

### Code Quality Guidelines
- Use services for all business logic (no inline calculations)
- Use shared components to avoid duplication
- Use `useAccountData` hook for account management
- Always use `account.settings.currency` instead of hardcoding
- No `console.log` in production code
- Remove commented code before committing

### Development Notes
- TypeScript strict mode enabled
- ESLint configured for React and TypeScript
- No testing framework currently configured
- Uses pnpm as package manager
- All user-facing text is in Chinese
- Theme provider simplified (no next-themes dependency)