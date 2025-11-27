#!/bin/bash

echo "🚀 RBAC Application - Quick Start"
echo "================================="
echo ""

# Check Node version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "✓ Node.js: $NODE_VERSION"

# Check pnpm
echo "Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "✗ pnpm not found. Installing..."
    npm install -g pnpm
else
    PNPM_VERSION=$(pnpm --version)
    echo "✓ pnpm: v$PNPM_VERSION"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Setup Supabase (see README.md)"
echo "2. Copy .env.example to apps/web/.env.local"
echo "3. Fill in your Supabase credentials"
echo "4. Run: pnpm dev"
echo ""
echo "Test credentials:"
echo "  admin@example.com / password123"
echo "  manager@example.com / password123"
echo "  viewer@example.com / password123"
echo ""
