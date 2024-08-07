// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

const selector = '//button[@data-cy="onboarding-task-list-action-button"]';

export default class OnboardingMenu {
    readonly page: Page;
    readonly locator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.locator = page.locator(selector);
    }

    isVisible() {
        return this.page.isVisible(selector);
    }

    async isOpen() {
        return await this.isVisible() && (await this.locator.getAttribute('open')) !== null;
    }

    toggle() {
        return this.locator.click();
    }
}

export {OnboardingMenu};
