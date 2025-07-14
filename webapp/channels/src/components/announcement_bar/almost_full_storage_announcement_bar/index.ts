// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {saveStorageAnnouncementBarDismissal} from 'mattermost-redux/actions/preferences';
import {getStorageAnnouncementBarDismissState} from 'mattermost-redux/selectors/entities/preferences';

import {AlmostFullStorageAnnouncementBar} from './almost_full_storage_announcement_bar';

function mapStateToProps(state: GlobalState) {
    return {
        isDiscarded: getStorageAnnouncementBarDismissState(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators(
            {
                saveDismissedState: saveStorageAnnouncementBarDismissal,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AlmostFullStorageAnnouncementBar);
