// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

export {waitUntil} from 'async-wait-until';

const visibilityHidden = 'visibility: hidden !important;';
const displayNone = 'display: none !important;';
const hideTeamHeader = `.test-team-header {${visibilityHidden}} `;
const hidePostHeaderTime = `.post__time {${visibilityHidden}} `;
const hidePostProfileIcon = `.profile-icon {${visibilityHidden}} `;
const hideStatusIcon = `.status {${visibilityHidden}} `;
const hideModuleNews = `.wc-trigger-news--flex {${displayNone}} `;
const hideChannelFavorite = `.channel-header__favorites {${visibilityHidden}} `;

export async function hideDynamicChannelsContent(page: Page) {
    await page.addStyleTag({
        content:
            hideChannelFavorite +
            hideModuleNews +
            hidePostHeaderTime +
            hidePostProfileIcon +
            hideStatusIcon +
            hideTeamHeader,
    });
}

export async function waitForAnimationEnd(locator: Locator) {
    return locator.evaluate((element) =>
        Promise.all(element.getAnimations({subtree: true}).map((animation) => animation.finished)),
    );
}

export async function moveMouseToCenter(page: Page) {
    await page.mouse.move(0, 0);
}
