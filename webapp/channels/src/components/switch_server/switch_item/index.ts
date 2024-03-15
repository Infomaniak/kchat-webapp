
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Team} from '@mattermost/types/teams';

import type {GenericAction, GetStateFunc} from 'mattermost-redux/types/actions';

import {switchTeam} from 'actions/team_actions';
import {makeGetBadgeCountForServerId} from 'selectors/views/servers';

import type {GlobalState} from 'types/store';
import type {Server} from 'types/store/servers';

import SwitchItem from './switch_item';

type OwnProps = {
    server: Server;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
        unreadCounts: makeGetBadgeCountForServerId(state, ownProps.server.id),
        disabled: ownProps.server.status !== 'ok',
    };
}

type Actions = {
    switchTeam: (url: string, team?: Team) => (dispatch: Dispatch<GenericAction>, getState: GetStateFunc) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject, Actions>({
            switchTeam,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SwitchItem);
