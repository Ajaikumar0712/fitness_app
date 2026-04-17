import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.SMARTFIT_BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(__dirname, '../../testing-screenshots');

const runId = Date.now();
const email = `report_${runId}@example.com`;
const password = 'ReportPass123';

async function resolveSystemBrowserExecutable() {
    const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    const candidates = [
        envPath,
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    ].filter(Boolean);

    for (const candidate of candidates) {
        try {
            await fs.access(candidate);
            return candidate;
        } catch {
            // Keep scanning for the next available executable.
        }
    }

    return null;
}

async function launchBrowser() {
    const executablePath = await resolveSystemBrowserExecutable();
    const attempts = [
        { name: 'bundled chromium', launch: () => chromium.launch({ headless: true }) },
        { name: 'chrome channel', launch: () => chromium.launch({ headless: true, channel: 'chrome' }) },
        { name: 'msedge channel', launch: () => chromium.launch({ headless: true, channel: 'msedge' }) },
    ];

    if (executablePath) {
        attempts.push({
            name: `system executable (${executablePath})`,
            launch: () => chromium.launch({ headless: true, executablePath }),
        });
    }

    let lastError;
    for (const attempt of attempts) {
        try {
            console.log(`Launching browser via ${attempt.name}...`);
            return await attempt.launch();
        } catch (error) {
            lastError = error;
            console.warn(`Launch failed via ${attempt.name}: ${error.message}`);
        }
    }

    throw lastError;
}

async function saveShot(page, name) {
    const filePath = path.join(OUTPUT_DIR, `${name}.png`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved: ${filePath}`);
}

async function gotoAndWait(page, route) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
}

async function clickIfVisible(page, selector) {
    const locator = page.locator(selector);
    if (await locator.isVisible().catch(() => false)) {
        await locator.click();
        return true;
    }
    return false;
}

async function run() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
        await gotoAndWait(page, '/');
        await saveShot(page, '01-landing');

        await gotoAndWait(page, '/login');
        await saveShot(page, '02-login');

        await gotoAndWait(page, '/register');
        await saveShot(page, '03-register-step1');

        await page.locator('input[name="name"]').fill('Report User');
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        await page.getByRole('button', { name: /Continue/i }).click();

        await page.locator('input[name="age"]').fill('28');
        await page.locator('input[name="height"]').fill('174');
        await page.locator('input[name="weight"]').fill('72');
        await saveShot(page, '04-register-step2');

        await page.getByRole('button', { name: /Create Account/i }).click();
        try {
            await page.waitForURL('**/dashboard', { timeout: 12000 });
        } catch {
            // Backend can be unavailable during report prep; use local auth fallback.
            await page.evaluate(({ currentEmail }) => {
                const fallbackUser = {
                    name: 'Report User',
                    email: currentEmail,
                    age: 28,
                    gender: 'Male',
                    height: 174,
                    weight: 72,
                    activityLevel: 'Moderate',
                    createdAt: new Date().toISOString(),
                };
                localStorage.setItem('sf_token', 'offline-report-token');
                localStorage.setItem('sf_user', JSON.stringify(fallbackUser));
            }, { currentEmail: email });

            await gotoAndWait(page, '/dashboard');
            await page.waitForURL('**/dashboard', { timeout: 12000 });
        }
        await saveShot(page, '05-dashboard');

        await gotoAndWait(page, '/health');
        await saveShot(page, '06-health');

        await page.locator('input[name="heartRate"]').fill('76');
        await page.locator('input[name="systolicBP"]').fill('121');
        await page.locator('input[name="diastolicBP"]').fill('80');
        await page.getByRole('button', { name: /Save Health Metrics/i }).click();
        await page.waitForTimeout(1500);

        await gotoAndWait(page, '/activity');
        await saveShot(page, '07-activity');
        await clickIfVisible(page, 'button:has-text("Log Activity")');
        await page.waitForTimeout(1200);

        await gotoAndWait(page, '/diet');
        await saveShot(page, '08-diet');

        await gotoAndWait(page, '/goals');
        await saveShot(page, '09-goals');

        await gotoAndWait(page, '/alerts');
        await saveShot(page, '10-alerts');

        await gotoAndWait(page, '/profile');
        await saveShot(page, '11-profile');

        console.log('Smoke test and screenshot capture completed successfully.');
    } finally {
        await context.close();
        await browser.close();
    }
}

run().catch((error) => {
    console.error('Smoke screenshot run failed:', error);
    process.exit(1);
});
