// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import AppStoreBar from './appstore_announcement_bar';

function mapStateToProps(state: GlobalState) {
    const {MASLatestVersion} = state.entities.general.config;

    return {
        latestVersion: MASLatestVersion,
    };
}

export default connect(mapStateToProps)(AppStoreBar);
