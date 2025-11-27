import { test, expect } from '@playwright/test';

test.describe('RBAC Admin E2E', () => {
  test('admin can create role and view it', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/');
    
    // Navigate to roles page
    await page.click('a[href="/roles"]');
    await expect(page).toHaveURL('/roles');
    
    // Create new role
    await page.click('a[href="/roles/new"]');
    await page.fill('#slug', 'test-role');
    await page.fill('#name', 'Test Role');
    await page.click('button[type="submit"]');
    
    // Should redirect back to roles list
    await page.waitForURL('/roles');
    await expect(page.locator('text=Test Role')).toBeVisible();
  });

  test('viewer cannot access role creation', async ({ page }) => {
    // Login as viewer
    await page.goto('/login');
    await page.fill('input[type="email"]', 'viewer@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/');
    
    // Try to navigate to create role (should be redirected to 403)
    await page.goto('/roles/new');
    await expect(page.locator('text=403')).toBeVisible();
  });
});
