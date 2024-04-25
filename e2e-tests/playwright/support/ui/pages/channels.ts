// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';

import {components} from '@e2e-support/ui/components';

export default class ChannelsPage {
    readonly channels = 'Channels';

    readonly page: Page;

    readonly globalHeader;
    readonly centerView;
    readonly sidebarLeft;
    readonly sidebarRight;
    readonly appBar;

    readonly findChannelsModal;
    readonly deletePostModal;
    readonly settingsModal;

    readonly postDotMenu;
    readonly postReminderMenu;

    readonly emojiGifPickerPopup;

    constructor(page: Page) {
        this.page = page;

        // The main areas of the app
        this.globalHeader = new components.GlobalHeader(page.locator('#global-header'));
        this.centerView = new components.ChannelsCenterView(page.getByTestId('channel_view'));
        this.sidebarLeft = new components.ChannelsSidebarLeft(page.locator('#SidebarContainer'));
        this.sidebarRight = new components.ChannelsSidebarRight(page.locator('#sidebar-right'));
        this.appBar = new components.ChannelsAppBar(page.locator('.app-bar'));

        // Modals
        this.findChannelsModal = new components.FindChannelsModal(page.getByRole('dialog', {name: 'Find Channels'}));
        this.deletePostModal = new components.DeletePostModal(page.locator('#deletePostModal'));
        this.settingsModal = new components.SettingsModal(page.getByRole('dialog', {name: 'Settings'}));

        // Menus
        this.postDotMenu = new components.PostDotMenu(page.getByRole('menu', {name: 'Post extra options'}));
        this.postReminderMenu = new components.PostReminderMenu(page.getByRole('menu', {name: 'Set a reminder for:'}));

        // Popovers
        this.emojiGifPickerPopup = new components.EmojiGifPicker(page.locator('#emojiGifPicker'));
    }

    async toBeVisible() {
        await this.centerView.toBeVisible();
    }

    async goto(teamName = '', channelName = '') {
        let channelsUrl = '/';
        if (teamName) {
            channelsUrl += `${teamName}`;
            if (channelName) {
                channelsUrl += `/${channelName}`;
            }
        }

        await this.page.goto(channelsUrl);
    }
}

export {ChannelsPage};
