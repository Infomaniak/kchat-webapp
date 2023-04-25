// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import {Preferences} from '../../../utils/constants';

import RhsSettingsCompact from './rhs_settings_compact';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
        messageDisplay: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.MESSAGE_DISPLAY, Preferences.MESSAGE_DISPLAY_DEFAULT),
        colorizeUsernames: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.COLORIZE_USERNAMES, Preferences.COLORIZE_USERNAMES_DEFAULT),
    };
}

const mapDispatchToProps = {
    savePreferences,
};

export default connect(mapStateToProps, mapDispatchToProps)(RhsSettingsCompact);
