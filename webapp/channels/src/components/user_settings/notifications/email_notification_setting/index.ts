// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch, ActionCreatorsMapObject} from 'redux';
import {bindActionCreators} from 'redux';

import type {PreferenceType} from '@mattermost/types/preferences';
import type {GlobalState} from '@mattermost/types/store';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import type {ActionFunc} from 'mattermost-redux/types/actions';

import EmailNotificationSetting from './email_notification_setting';

type Actions = {
    savePreferences: (currentUserId: string, emailIntervalPreference: PreferenceType[]) =>
    Promise<{data: boolean}>;
}

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const emailInterval = parseInt(getPreference(
        state,
        Preferences.CATEGORY_NOTIFICATIONS,
        Preferences.EMAIL_INTERVAL,
        Preferences.INTERVAL_NOT_SET.toString(),
    ), 10);

    return {
        currentUserId: getCurrentUserId(state),
        emailInterval,
        enableEmailBatching: config.EnableEmailBatching === 'true',
        sendEmailNotifications: config.SendEmailNotifications === 'true',
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotificationSetting);
