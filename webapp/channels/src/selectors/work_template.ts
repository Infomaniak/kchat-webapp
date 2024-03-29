// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

export const areWorkTemplatesEnabled = createSelector(
    'areWorktemplatesEnabled',
    (state: GlobalState) => getFeatureFlagValue(state, 'WorkTemplate') === 'true',
    (state: GlobalState) => getFeatureFlagValue(state, 'BoardsProduct') === 'true',
    (state: GlobalState) => Boolean(state.plugins.plugins?.playbooks),
    (workTemplateFF, boardProductEnabled, pluginPlaybooksInstalled) => {
        return workTemplateFF && boardProductEnabled && pluginPlaybooksInstalled;
    },
);

