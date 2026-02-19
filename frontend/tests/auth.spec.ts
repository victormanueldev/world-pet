import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
    test('should load the login page', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/World Pet/);
        await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
        await expect(page.getByLabel('Email address')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('should navigate to owner registration', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: 'Sign up' }).click();
        await expect(page).toHaveURL(/\/register$/);
        await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    });

    test('should navigate to admin registration', async ({ page }) => {
        await page.goto('/register');
        await page.getByRole('link', { name: 'Register your clinic here' }).click();
        await expect(page).toHaveURL(/\/register\/admin$/);
        await expect(page.getByRole('heading', { name: 'Register your Clinic' })).toBeVisible();
    });

    test('should validate empty login form', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Sign in' }).click();
        // HTML5 validation or Zod validation
        // Since we use react-hook-form, we expect validation messages if HTML5 validation doesn't block it first.
        // However, basic inputs without 'required' attribute rely on JS validation.
        // In our case, we haven't verified if HTML5 required is set, but let's check for validation messages
        // Wait for JS validation to kick in
        // Note: Zod schema error messages
        // "Invalid email address"
        // "Password must be at least 6 characters"

        // Actually, react-hook-form handleSubmit won't fire if validation fails, 
        // and since we are checking for error text existence:

        // We didn't add data-testid or specific roles for error messages, but we can look by text.
        // Let's check if the button is still enabled (it is), and if we see error text.
        await expect(page.getByText('Invalid email address')).toBeVisible();
        await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
    });
});
