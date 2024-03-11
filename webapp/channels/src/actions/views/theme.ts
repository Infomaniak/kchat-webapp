// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {ThemeTypes} from 'utils/constants';

export type CloseModalType = {
    type: string;
    modalId: string;
}

export function setTheme(theme: Theme) {
    return {
        type: ThemeTypes.RECEIVED_THEME,
        data: {
            theme,
        },
    };
}

export function setThemePreference(theme: 'light' | 'dark') {
    return {
        type: ThemeTypes.RECEIVED_THEME_PREFERENCE,
        data: {
            theme,
        },
    };
}
