import { test, expect } from '@playwright/test';

test.describe('SmartFit System Tests', () => {
    test('should load landing page and display hero text', async ({ page }) => {
        await page.goto('/');
        const heroText = page.locator('h1', { hasText: 'Take Control of Your Health' });
        await expect(heroText).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Sign In');
        await expect(page).toHaveURL(/.*login/);
    });

    test('should show registration form steps', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('text=Account Info')).toBeVisible();
        
        // Fill step 1
        await page.fill('input[placeholder*="your@email.com"]', 'sys@test.com');
        await page.fill('input[placeholder*="Magesh P"]', 'System Test');
        await page.fill('input[type="password"]', 'Password123');
        
        await page.click('button:has-text("Continue")');
        
        await expect(page.locator('text=Health Profile')).toBeVisible();
    });
});
