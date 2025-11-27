# Full-Stack RBAC Application

**Webzenith Solutions Technical Assignment**

A production-ready Role-Based Access Control (RBAC) system built with Next.js, Supabase, and Turborepo.

## 🎯 Features

- ✅ **Custom Roles** - Create unlimited roles with enable/disable functionality
- ✅ **Fine-Grained Permissions** - Entity.operation permission pattern (e.g., `users.create`)
- ✅ **Permission Bundles** - Group permissions for bulk assignment
- ✅ **User Management** - Create users and assign exactly one role
- ✅ **Runtime Enforcement** - Frontend UI hiding + backend API checks
- ✅ **Type-Safe** - Full TypeScript with Zod validation
- ✅ **Monorepo** - Turborepo with pnpm workspaces
- ✅ **Tests** - Unit, integration, and E2E tests included

---

## 📋 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui components
- **TanStack Query** (React Query)
- **Zod** for validation

### Backend
- **Supabase** (Auth + Postgres Database)
- **Next.js API Routes**
- Server-side permission checks

### Monorepo
- **Turborepo**
- **pnpm** (v8+)
- **t3-env** for type-safe environment variables

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Supabase account ([Sign up](https://supabase.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd interntask
pnpm install
```

### 2. Setup Supabase

#### Option A: Remote Supabase (Recommended for demo)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API**
3. Copy your credentials:
   - `Project URL`
   - `anon public` key
   - `service_role` key (Settings > API > Project API keys)

4. Run migrations in **SQL Editor**:
   - Copy `infra/supabase/migrations/001_initial_schema.sql` and execute
   - Copy `infra/supabase/seed.sql` and execute

5. Create test users in **Authentication > Users**:
   - `admin@example.com` / `password123`
   - `manager@example.com` / `password123`
   - `viewer@example.com` / `password123`

6. Assign roles (run in SQL Editor):
```sql
UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'admin') 
WHERE email = 'admin@example.com';

UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'manager') 
WHERE email = 'manager@example.com';

UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE slug = 'viewer') 
WHERE email = 'viewer@example.com';
```

#### Option B: Local Supabase (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 3. Configure Environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
# From project root
pnpm dev

# Or run specific app
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Test Credentials

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@example.com` | `password123` | Admin | All permissions |
| `manager@example.com` | `password123` | Manager | Read all + Create/Update (leads, products, campaigns, tickets, users) |
| `viewer@example.com` | `password123` | Viewer | Read-only access |

---

## 📁 Project Structure

```
interntask/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages
│       │   ├── api/           # API routes
│       │   ├── roles/         # Roles management UI
│       │   ├── permissions/   # Permissions management UI
│       │   ├── users/         # Users management UI
│       │   └── bundles/       # Permission bundles UI
│       ├── components/        # React components
│       ├── hooks/             # useAuth, usePermissions
│       ├── lib/               # Utilities (permissions, Supabase clients)
│       ├── services/          # Database services
│       └── tests/             # Unit, integration, E2E tests
├── packages/
│   ├── types/                 # Shared TypeScript types
│   └── ui/                    # Shared UI components
├── infra/
│   └── supabase/
│       ├── migrations/        # Database schema
│       └── seed.sql           # Sample data
└── turbo.json                 # Turborepo config
```

---

## 🧪 Running Tests

### Unit Tests

```bash
pnpm --filter web test
```

### Integration Tests

```bash
# Requires running dev server
pnpm --filter web test:integration
```

### E2E Tests

```bash
# Install Playwright
pnpm --filter web exec playwright install

# Run E2E tests
pnpm --filter web test:e2e
```

---

## 🏗️ Build for Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm --filter web start
```

---

## 🐳 Docker Deployment (Optional)

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
```

Build and run:

```bash
docker build -t rbac-app -f apps/web/Dockerfile .
docker run -p 3000:3000 --env-file apps/web/.env.local rbac-app
```

---

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy!

---

## 📚 API Documentation

### Authentication
All API routes require Supabase session authentication.

### Endpoints

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| `GET` | `/api/me` | Get current user profile | Authenticated |
| `GET` | `/api/roles` | List all roles | `roles.read` |
| `POST` | `/api/roles` | Create role | `roles.create` |
| `GET` | `/api/roles/[id]` | Get role details | `roles.read` |
| `PATCH` | `/api/roles/[id]` | Update role | `roles.update` |
| `DELETE` | `/api/roles/[id]` | Delete role | `roles.delete` |
| `POST` | `/api/roles/[id]/permissions` | Assign permissions | `roles.update` |
| `DELETE` | `/api/roles/[id]/permissions/[permId]` | Remove permission | `roles.update` |
| `POST` | `/api/roles/[id]/bundles` | Assign bundle | `roles.update` |
| `GET` | `/api/permissions` | List permissions | `permissions.read` |
| `POST` | `/api/permissions` | Create permission | `permissions.create` |
| `GET` | `/api/users` | List users | `users.read` |
| `POST` | `/api/users` | Create user | `users.create` |
| `GET` | `/api/users/[id]` | Get user details | `users.read` |
| `PATCH` | `/api/users/[id]` | Update user | `users.update` |
| `DELETE` | `/api/users/[id]` | Delete user | `users.delete` |
| `GET` | `/api/bundles` | List bundles | `permissions.read` |
| `POST` | `/api/bundles` | Create bundle | `permissions.create` |

---

## ✅ Acceptance Criteria Checklist

- [x] **1.** Turborepo + pnpm + Next.js App Router + TypeScript
- [x] **2.** Supabase for Auth & DB with migrations and seed data
- [x] **3.** Admin UI for roles, permissions, and bundles
- [x] **4.** Users assigned exactly one role
- [x] **5.** Frontend fetches and caches permissions via TanStack Query
- [x] **6.** Backend checks permissions server-side (403 for unauthorized)
- [x] **7.** Zod validation on all API payloads
- [x] **8.** README with run/deploy/test instructions
- [x] **9.** Sample credentials provided
- [x] **10.** Tests (unit + integration + E2E)

---

## 🛠️ Development Notes

### Permission Helper Usage

```typescript
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { can } = usePermissions()
  
  return (
    <Button disabled={!can('leads.create')}>
      Create Lead
    </Button>
  )
}
```

### Adding New Permissions

1. **Via UI**: Go to `/permissions` and add entity + operation
2. **Via SQL**:
```sql
INSERT INTO permissions (entity, operation, key, description)
VALUES ('reports', 'export', 'reports.export', 'Export reports');
```

### Extending Entities

Add new entities by creating permissions with new entity names. The system is fully extensible.

---

## 🤝 Contributing

This project was built for the Webzenith Solutions Technical Assignment. For production use, consider:

- Adding audit logs
- Implementing rate limiting
- Adding more comprehensive tests
- Setting up CI/CD pipelines
- Adding monitoring and alerting

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for Webzenith Solutions**
