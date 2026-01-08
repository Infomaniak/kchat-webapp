// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {isStaff} from 'utils/team_utils';
import {isInIframe} from 'utils/url-ksuite-redirect';

import type {GlobalState} from 'types/store';

import ReportingToolsButton from './reporting_tools_button';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state);

    return {
        show: isStaff(currentTeam) && !isInIframe(),
    };
}

export default connect(mapStateToProps, null)(ReportingToolsButton);
