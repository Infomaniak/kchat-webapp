// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {AdminConfig} from '@mattermost/types/config';

import {updateConfig} from 'mattermost-redux/actions/admin';
import {getConfig} from 'mattermost-redux/selectors/entities/admin';
import type {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import type {GlobalState} from 'types/store';

import EditPostTimeLimitModal from './edit_post_time_limit_modal';

type Actions = {
    updateConfig: (config: AdminConfig) => ActionFunc;
}

function mapStateToProps(state: GlobalState) {
    return {
        config: getConfig(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({updateConfig}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPostTimeLimitModal);
