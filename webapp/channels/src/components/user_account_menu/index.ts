// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {getKSuiteBridge} from 'mattermost-redux/selectors/entities/ksuiteBridge';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUser, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';
import {getCurrentLocale} from 'selectors/i18n';
import {makeGetCustomStatus, isCustomStatusExpired, isCustomStatusEnabled} from 'selectors/views/custom_status';

import {isStaff} from 'utils/team_utils';

import type {GlobalState} from 'types/store';

import UserAccountMenu from './user_account_menu';

function makeMapStateToProps() {
    const getCustomStatus = makeGetCustomStatus();

    return function mapStateToProps(state: GlobalState) {
        const currentUser = getCurrentUser(state);
        const userId = currentUser?.id;
        const username = currentUser?.username;
        const userFirstName = currentUser?.first_name;
        const userLastName = currentUser?.last_name;
        const customStatus = getCustomStatus(state, userId);
        const currentTeam = getCurrentTeam(state);
        const showNextSwitch = isStaff(currentTeam);
        const ksuiteBridge = getKSuiteBridge(state);
        const locale = getCurrentLocale(state);

        return {
            locale,
            userId,
            username,
            userFirstName,
            userLastName,
            profilePicture: Client4.getProfilePictureUrl(userId, currentUser?.last_picture_update),
            autoResetPref: get(state, Preferences.CATEGORY_AUTO_RESET_MANUAL_STATUS, userId, ''),
            status: getStatusForUserId(state, userId),
            customStatus,
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            timezone: getCurrentTimezone(state),
            showNextSwitch,
            ksuiteBridge,
            isBridgeConnected: ksuiteBridge?.isConnected,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

const connector = connect(makeMapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(UserAccountMenu);
