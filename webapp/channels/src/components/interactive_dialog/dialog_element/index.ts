// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {autocompleteChannels} from 'actions/channel_actions';
import {autocompleteUsers} from 'actions/user_actions';

import type {Props} from './dialog_element';
import DialogElement from './dialog_element';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Props['actions']>({
            autocompleteChannels,
            autocompleteUsers,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(DialogElement);
