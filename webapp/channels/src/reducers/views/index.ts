// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import addChannelCtaDropdown from './add_channel_cta_dropdown';
import addChannelDropdown from './add_channel_dropdown';
import admin from './admin';
import announcementBar from './announcement_bar';
import browser from './browser';
import calls from './calls';
import channel from './channel';
import channelSelectorModal from './channel_selector_modal';
import channelSidebar from './channel_sidebar';
import drafts from './drafts';
import emoji from './emoji';
import i18n from './i18n';
import kmeetCalls from './kmeet_calls';
import lhs from './lhs';
import marketplace from './marketplace';
import modals from './modals';
import notice from './notice';
import onboardingTasks from './onboarding_tasks';
import posts from './posts';
import productMenu from './product_menu';
import rhs from './rhs';
import rhsSuppressed from './rhs_suppressed';
import search from './search';
import servers from './servers';
import settings from './settings';
import statusDropdown from './status_dropdown';
import system from './system';
import textbox from './textbox';
import theme from './theme';
import threads from './threads';

export default combineReducers({
    admin,
    announcementBar,
    browser,
    channel,
    rhs,
    rhsSuppressed,
    posts,
    modals,
    emoji,
    i18n,
    lhs,
    search,
    notice,
    system,
    channelSelectorModal,
    settings,
    marketplace,
    textbox,
    channelSidebar,
    statusDropdown,
    addChannelDropdown,
    addChannelCtaDropdown,
    onboardingTasks,
    threads,
    productMenu,
    drafts,
    calls,
    kmeetCalls,
    theme,
    servers,
});
