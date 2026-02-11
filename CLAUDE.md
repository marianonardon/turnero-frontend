# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**slotia** (formerly Turnero Web SaaS) is a multi-tenant B2B scheduling/booking platform built with Next.js 14. It allows businesses to manage appointments online with full branding customization.

- **Target**: B2B SaaS (admin is the paying customer)
- **Architecture**: Multi-tenant with tenant-branded client-facing pages
- **Current Brand**: slotia (lowercase)

## Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)

# Building
npm run build            # Production build

# Production
npm start                # Start production server

# Linting
npm run lint             # Run Next.js linter
```

## Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend NestJS API URL
```

**Important**: In production (Vercel), `NEXT_PUBLIC_API_URL` must be set to the backend's production URL.

## Architecture

### Multi-Tenant Routing

The app uses Next.js App Router with two distinct routing patterns:

1. **Admin Routes** (`/admin/*`, `/onboarding`, `/login`): Protected admin dashboard
2. **Tenant-Branded Routes** (`/[tenantSlug]/*`): Public client-facing pages with tenant branding
3. **Landing Page** (`/landing`): Marketing/sales page to attract new admin customers

### Key Architectural Patterns

**State Management**:
- TanStack Query (React Query v5) for server state
- React Context for auth (`lib/context/AuthContext.tsx`) and tenant data (`lib/context/TenantContext.tsx`)

**API Layer** (`lib/api/`):
- `client.ts`: Base API client with tenant-aware headers (`x-tenant-id`)
- `endpoints.ts`: Organized API endpoints by module (tenants, services, professionals, appointments)
- `hooks.ts`: React Query hooks for all API operations
- `types.ts`: TypeScript types for API requests/responses

**Component Organization**:
- `components/admin/`: Admin dashboard components
- `components/client/`: Public booking flow components
- `components/ui/`: shadcn/ui components
- `components/auth/`: Authentication-related components

### Multi-Tenancy Strategy

**Frontend Tenant Handling**:
- Tenant identified via route parameter (`[tenantSlug]`) or context
- API client automatically includes `x-tenant-id` header
- Public endpoints don't require authentication but are tenant-scoped

**Backend Integration**:
- Backend is a separate NestJS application (not in this repo)
- Row-level tenant isolation (all entities filtered by `tenant_id`)
- See `TECHNICAL_ARCHITECTURE.md` for full backend details

## Booking Flow

The client booking process is a multi-step wizard:

1. Service selection (`ServiceSelection.tsx`)
2. Professional selection (if multiple) (`ProfessionalSelection.tsx`)
3. Date/time selection (`DateTimeSelection.tsx`)
4. Client info form (`ClientInfoForm.tsx`)
5. Confirmation (`BookingConfirmation.tsx`)

Main component: `components/client/ClientBooking.tsx`

## Admin Onboarding

New admin users go through a guided onboarding wizard (`components/admin/OnboardingWizard.tsx`) to set up:
- Business info and branding
- Services
- Professionals
- Schedule configuration

Goal: Admin can configure their booking system in < 10 minutes.

## Forms and Validation

- **Forms**: React Hook Form
- **Validation**: Zod schemas
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)

## TypeScript Paths

Import alias `@/*` maps to the root directory:
```typescript
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
```

## API Client Usage

Always use React Query hooks from `lib/api/hooks.ts`:

```typescript
// Fetch data
const { data: services, isLoading } = useServices()

// Mutations
const createService = useCreateService()
createService.mutate({ name: 'Haircut', duration: 60, price: 5000 })
```

**Important**: The API client (`apiClient`) in `lib/api/client.ts` handles:
- Automatic `x-tenant-id` header injection
- Request/response logging
- Error handling and normalization
- CORS configuration

## Key Files for Understanding Architecture

- `README.md`: Product vision and feature overview
- `TECHNICAL_ARCHITECTURE.md`: Complete technical architecture (frontend + backend)
- `PRODUCT_DEFINITION.md`: User personas, journeys, and UX design
- `PRISMA_SCHEMA.md`: Complete database schema (backend)
- `BUSINESS_MODEL.md`: B2B business model and metrics

## Styling

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui (customizable Radix UI components)
- **Theming**: CSS variables for tenant branding customization
- **Animations**: tailwindcss-animate

## Important Patterns

**Tenant Context**:
- Always access tenant data through `TenantContext` in tenant-branded pages
- Use `useTenantBySlug(slug)` hook to fetch tenant configuration

**React Query Configuration**:
- Query keys follow pattern: `['entity', id]` or `['entity', 'filter', value]`
- Mutations automatically invalidate related queries
- Availability queries use `staleTime: 0` to ensure fresh data

**Loading States**:
- Use `Suspense` boundaries where appropriate
- Display skeleton loaders for better UX

## Admin Dashboard

Main component: `components/admin/AdminDashboard.tsx`

Dashboard tabs:
- Overview (`DashboardOverview.tsx`)
- Services Manager (`ServicesManager.tsx`)
- Professionals Manager (`ProfessionalsManager.tsx`)
- Schedules Manager (`SchedulesManager.tsx`)
- Appointments Manager (`AppointmentsManager.tsx`)
- Settings Panel (`SettingsPanel.tsx`)

## Testing & Debugging

**API Debugging**:
- API client logs all requests to console with detailed info
- Check browser console for `[API Client]` logs
- Verify `NEXT_PUBLIC_API_URL` is correctly configured

**Common Issues**:
- CORS errors: Backend must allow frontend origin
- "localhost" in production: `NEXT_PUBLIC_API_URL` not set in Vercel
- 401 errors: Check tenant ID is being passed correctly

## Git Workflow

- Main branch: `main`
- Recent rebranding from "agendalo" to "slotia" (lowercase)
- Brand references should always use "slotia" (lowercase)

## Additional Documentation

For deeper understanding, review these files in order:
1. `README.md` - Start here for product overview
2. `TECHNICAL_ARCHITECTURE.md` - Complete architecture
3. `lib/api/hooks.ts` - Available API operations
4. `components/admin/` - Admin UI patterns
5. `components/client/` - Client booking flow

# Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, **STOP and re-plan immediately** - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
