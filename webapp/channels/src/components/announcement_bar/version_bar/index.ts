// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import VersionBar from './version_bar';

function mapStateToProps(state: GlobalState) {
    const {BuildHash, IsNewVersionCanaryOnly} = state.entities.general.config;

    // IK: In case of unknown hash, 'none' is received - We ignore it
    const buildHash = BuildHash === 'none' ? undefined : BuildHash;
    return {
        buildHash,
        isNewVersionCanaryOnly: IsNewVersionCanaryOnly,
    };
}

export default connect(mapStateToProps)(VersionBar);
