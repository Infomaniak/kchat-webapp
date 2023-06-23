// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';

import VersionBar from './version_bar';

function mapStateToProps(state: GlobalState) {
    const {BuildHash, IsNewVersionCanaryOnly} = state.entities.general.config;
    return {
        buildHash: BuildHash,
        isNewVersionCanaryOnly: IsNewVersionCanaryOnly,
    };
}

export default connect(mapStateToProps)(VersionBar);
