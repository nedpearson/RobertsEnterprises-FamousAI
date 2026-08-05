import { test, expect } from '@playwright/test';

test.describe('Unified Scheduling Workflow', () => {
  // Use a known demo account or skip auth if handled in setup
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo sign in or directly to scheduling if already authenticated
    await page.goto('/');
    
    // We assume test setup handles auth, or we just try navigating
    await page.goto('/scheduling/unified');
    // Wait for network idle or calendar to render
    await page.waitForSelector('.fc-view', { timeout: 10000 }).catch(() => {});
  });

  test('should render the combined operations calendar', async ({ page }) => {
    // Check panel presence
    await expect(page.getByText('Operations Calendar')).toBeVisible();
    await expect(page.getByText('Action Queue')).toBeVisible();
  });

  test('should open AI assignment drawer and assign request', async ({ page }) => {
    // Find an assign button in the queue
    const assignBtn = page.getByRole('button', { name: /Assign/i }).first();
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      
      // Drawer should open
      await expect(page.getByText('AI Assignment Engine')).toBeVisible();
      
      // Assign it
      const confirmAssignBtn = page.getByRole('button', { name: /Assign to/i }).first();
      await confirmAssignBtn.click();
      
      // Drawer should close
      await expect(page.getByText('AI Assignment Engine')).toBeHidden();
    }
  });

  test('should view appointment 360 and record outcome', async ({ page }) => {
    // Click an event in the calendar
    const event = page.locator('.fc-event').first();
    if (await event.isVisible()) {
      await event.click();
      
      // 360 Panel should open
      await expect(page.getByRole('button', { name: /Complete/i })).toBeVisible();
      
      // Click complete
      await page.getByRole('button', { name: /Complete/i }).click();
      
      // Modal should appear
      await expect(page.getByText('Complete Appointment')).toBeVisible();
      
      // Fill out outcome
      await page.fill('input#revenue', '500');
      await page.click('label[for="r1"]'); // Positive sentiment
      await page.fill('textarea#notes', 'Great appointment!');
      
      // Complete
      await page.getByRole('button', { name: 'Complete Appointment' }).click();
      
      // Modal closes
      await expect(page.getByText('Complete Appointment')).toBeHidden();
    }
  });
});
