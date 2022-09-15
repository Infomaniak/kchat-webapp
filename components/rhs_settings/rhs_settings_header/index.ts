// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getIsMobileView} from 'selectors/views/browser';

import RhsSettings, {Props} from './rhs_settings_header';

function mapStateToProps(state: GlobalState) {
    const isMobile = getIsMobileView(state);
    return {
        isMobile,
    } as unknown as Props;
}

export default connect(mapStateToProps)(RhsSettings);
