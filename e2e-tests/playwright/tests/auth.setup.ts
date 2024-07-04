import testConfig from '@e2e-test.config';
import {test as setup} from '@e2e-support/test_fixture';
import {expect} from '@playwright/test';

const authFile = '.auth/user.json';

setup('Authenticate', async ({page, context}) => {
    // Setup auth state in .auth/user.json
    // Ref https://playwright.dev/docs/auth#basic-shared-account-in-all-tests

    // Assert that login URL is present
    if (typeof testConfig.authBaseURL === 'undefined') {
        throw new Error('testConfig.authBaseURL is required');
    }

    // Cleaning cache...
    await context.clearCookies();

    // Go in the website...
    await page.goto(testConfig.authBaseURL);
    await page.locator('input[name="login"]').fill(testConfig.adminEmail);
    await page.locator('input[name="password"]').fill(testConfig.adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Assert the presence of SASESSION cookie
    const cookies = await page.context().cookies();
    expect(cookies).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                name: 'SASESSION',
            }),
        ]),
    );

    await page.context().storageState({path: authFile});
});
