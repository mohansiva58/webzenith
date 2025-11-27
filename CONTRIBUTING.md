# Development Setup Guide

## Initial Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Setup Supabase**
   - Follow instructions in main README.md
   - Run migrations and seed data
   - Create test users

3. **Configure environment**
   - Copy `.env.example` to `apps/web/.env.local`
   - Fill in Supabase credentials

4. **Start development server**
```bash
pnpm dev
```

## Development Workflow

### Adding New Features

1. **Create a new branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make changes**
   - Follow existing code structure
   - Add TypeScript types
   - Include Zod validation for new API routes

3. **Test your changes**
```bash
pnpm --filter web test
pnpm --filter web test:e2e
```

4. **Commit and push**
```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic

### Adding New Permissions

1. Create permission via UI at `/permissions`
2. Or add directly to database:
```sql
INSERT INTO permissions (entity, operation, key, description)
VALUES ('your_entity', 'your_operation', 'your_entity.your_operation', 'Description');
```

### Adding New API Routes

1. Create route in `apps/web/app/api/`
2. Add Zod validation schema in `lib/validations.ts`
3. Use permission check helper
4. Return appropriate HTTP status codes

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check permissions...
  // Your logic here...
}
```

## Troubleshooting

### TypeScript Errors

- Run `pnpm --filter web build` to check for type errors
- Check `tsconfig.json` paths are correct

### Supabase Connection Issues

- Verify environment variables
- Check Supabase project is not paused
- Verify RLS policies are enabled

### Build Errors

- Clear `.next` cache: `rm -rf apps/web/.next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check for missing peer dependencies

## Testing

### Unit Tests
```bash
pnpm --filter web test
```

### Integration Tests
```bash
# Start dev server first
pnpm dev

# In another terminal
pnpm --filter web test tests/integration
```

### E2E Tests
```bash
# Install browsers (first time only)
pnpm --filter web exec playwright install

# Run tests
pnpm --filter web test:e2e
```

## Database Migrations

When modifying the database schema:

1. Create a new migration file in `infra/supabase/migrations/`
2. Name it with incremental number: `002_your_change.sql`
3. Test locally first
4. Apply to production via Supabase Dashboard

## Deployment

See main README.md for deployment instructions.
