// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {getOAuthApp, editOAuthApp} from 'mattermost-redux/actions/integrations';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import EditOAuthApp from './edit_oauth_app';

type Props = {
    location: Location;
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);
    const oauthAppId: string = (new URLSearchParams(ownProps.location.search)).get('id') || '';
    const enableOAuthServiceProvider = config.EnableOAuthServiceProvider === 'true';

    return {
        oauthAppId,
        oauthApp: state.entities.integrations.oauthApps[oauthAppId],
        enableOAuthServiceProvider,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getOAuthApp,
            editOAuthApp,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditOAuthApp);
