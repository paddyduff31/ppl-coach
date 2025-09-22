import { test, expect } from '@playwright/test';

test.describe('Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-login"]');
    await page.waitForURL('/dashboard');
  });

  test('should create and log a workout session', async ({ page }) => {
    // Navigate to log session
    await page.click('[data-testid="log-session-button"]');
    await expect(page).toHaveURL(/.*log-session/);

    // Add an exercise
    await page.click('[data-testid="add-exercise-button"]');
    await page.click('[data-testid="exercise-bench-press"]');

    // Log sets
    await page.fill('[data-testid="weight-input-0"]', '135');
    await page.fill('[data-testid="reps-input-0"]', '10');
    await page.click('[data-testid="add-set-button"]');

    await page.fill('[data-testid="weight-input-1"]', '145');
    await page.fill('[data-testid="reps-input-1"]', '8');

    // Save session
    await page.click('[data-testid="save-session-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="recent-session"]')).toBeVisible();
  });

  test('should shuffle workouts based on equipment', async ({ page }) => {
    await page.goto('/plan-day');

    // Select equipment
    await page.click('[data-testid="equipment-barbell"]');
    await page.click('[data-testid="equipment-dumbbells"]');

    // Generate workout
    await page.click('[data-testid="shuffle-button"]');

    // Should show recommended exercises
    await expect(page.locator('[data-testid="recommended-exercise"]')).toHaveCount(6);
  });
});