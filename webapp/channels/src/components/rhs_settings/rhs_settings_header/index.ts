// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getIsMobileView} from 'selectors/views/browser';

import type {GlobalState} from 'types/store';

import type {Props} from './rhs_settings_header';
import RhsSettings from './rhs_settings_header';

function mapStateToProps(state: GlobalState) {
    const isMobile = getIsMobileView(state);
    return {
        isMobile,
    } as unknown as Props;
}

export default connect(mapStateToProps)(RhsSettings);
