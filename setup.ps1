# Quick Start Script for RBAC Application

Write-Host "🚀 RBAC Application - Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Node version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ pnpm not found. Installing..." -ForegroundColor Red
    npm install -g pnpm
} else {
    Write-Host "✓ pnpm: v$pnpmVersion" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Setup Supabase (see README.md)" -ForegroundColor White
Write-Host "2. Copy .env.example to apps/web/.env.local" -ForegroundColor White
Write-Host "3. Fill in your Supabase credentials" -ForegroundColor White
Write-Host "4. Run: pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  admin@example.com / password123" -ForegroundColor White
Write-Host "  manager@example.com / password123" -ForegroundColor White
Write-Host "  viewer@example.com / password123" -ForegroundColor White
Write-Host ""
