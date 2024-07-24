// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Post} from '@mattermost/types/posts';

import {addPostReminder} from 'mattermost-redux/actions/posts';
import {Preferences} from 'mattermost-redux/constants';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUserId, getUserByUsername} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import type {GlobalState} from 'types/store';

import IkPostponeReminderButtons from './ik_postpone_reminder_buttons';

interface OwnProps {
    post: Post ;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const timezone = getCurrentTimezone(state);
    const userId = getCurrentUserId(state);
    const isMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);
    const userByName = getUserByUsername(state, ownProps.post?.props?.username);
    return {
        userByName,
        userId,
        timezone,
        isMilitaryTime,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            addPostReminder,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(IkPostponeReminderButtons);
