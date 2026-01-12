// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {addPostReminder, markPostReminderAsDone} from 'mattermost-redux/actions/posts';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import IkPostponeReminderButtons from './ik_postpone_reminder_buttons';

function mapStateToProps(state: GlobalState) {
    const timezone = getCurrentTimezone(state);
    const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
    const currentUserId = getCurrentUserId(state);

    return {
        currentUserId,
        timezone,
        isMilitaryTime,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            addPostReminder,
            markPostReminderAsDone,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(IkPostponeReminderButtons);
