// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {GlobalState} from '@mattermost/types/store';

import MASMigrationBar from './mas_migration_bar';

function mapStateToProps(state: GlobalState) {
    const {ShowMASBanner} = state.entities.general.config;
    return {
        showMASBanner: ShowMASBanner === 'true',
    };
}

export default connect(mapStateToProps)(MASMigrationBar);
