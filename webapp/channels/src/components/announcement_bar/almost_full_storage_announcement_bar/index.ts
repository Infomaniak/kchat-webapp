// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {saveAlmostFullStorageBarVisibility} from 'mattermost-redux/actions/preferences';
import {getAlmostFullStorageVisibilityBar} from 'mattermost-redux/selectors/entities/preferences';

import {AlmostFullStorageAnnouncementBar} from './almost_full_storage_announcement_bar';

function mapStateToProps(state: GlobalState) {
    return {
        visibility: getAlmostFullStorageVisibilityBar(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators(
            {
                saveVisibility: saveAlmostFullStorageBarVisibility,
            },
            dispatch,
        ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AlmostFullStorageAnnouncementBar);
