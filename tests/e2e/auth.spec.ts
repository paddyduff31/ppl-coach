import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to register and login', async ({ page }) => {
    await page.goto('/');

    // Test registration flow
    await page.click('[data-testid="register-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.click('[data-testid="submit-register"]');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/);
  });

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="submit-login"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});