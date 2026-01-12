// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@e2e-support/test_fixture';
import {type ScreenshotOptions} from '@e2e-types';

test('Intro to channel as regular user', async ({pw, page, pages, browserName, viewport}, testInfo) => {
    // Create and sign in a new user
    // const {user} = await pw.initSetup();

    // Log in a user in new browser context
    // const {page} = await pw.testBrowser.login(user);

    // Visit a default channel page
    await channelsPage.goto();
    await channelsPage.toBeVisible();
    await channelsPage.closeOnboardingIfOpen();

    // Wait for Playbooks icon to be loaded in App bar, except in iphone
    // await expect(channelsPage.appBar.playbooksIcon).toBeVisible();

    // Hide dynamic elements of Channels page
    await pw.hideDynamicChannelsContent(page);

    // Match snapshot of channel intro page
    const testArgs = {page, browserName, viewport};
    const options: ScreenshotOptions = {
        mask: [
            page.locator('div.post-list__dynamic'),
            page.locator('div[id="channelHeaderDescription"]'),
        ]
    };
    await pw.matchSnapshot(testInfo, testArgs, options);
});
