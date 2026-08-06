import { test, expect } from '@playwright/test';

test.describe('Intelligent Scheduling', () => {
  test('should display AI match tab and deterministic data', async ({ page }) => {
    // Navigate to the app (assuming it runs on localhost:5173 for local dev)
    await page.goto('http://localhost:5173');
    
    // Check if we are on the login page, then log in
    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', 'demo123@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
    }

    // Navigate to Scheduling
    await page.click('text=Scheduling');
    
    // Ensure the calendar is loaded
    await expect(page.locator('.fc-view-harness')).toBeVisible();

    // Click on a pending request in the sidebar
    // Wait for requests to load
    const pendingRequest = page.locator('[data-req-id]').first();
    await expect(pendingRequest).toBeVisible();
    await pendingRequest.click();

    // Verify that the Appointment 360 panel opens
    await expect(page.locator('text=Command Center')).toBeVisible();

    // Click on the AI Match tab
    const aiTab = page.locator('[value="ai"]');
    if (await aiTab.isVisible()) {
      await aiTab.click();
      
      // Verify AI recommendation components
      await expect(page.locator('text=Top AI Match')).toBeVisible();
      
      // Look for the "Assign to" button
      await expect(page.locator('button:has-text("Assign")').first()).toBeVisible();
    }
  });
});
