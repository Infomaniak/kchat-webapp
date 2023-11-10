// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {ServerError} from '@mattermost/types/errors';
import type {OutgoingWebhook} from '@mattermost/types/integrations';
import type {GlobalState} from '@mattermost/types/store';

import {getOutgoingHook, updateOutgoingHook} from 'mattermost-redux/actions/integrations';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import type {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import EditOutgoingWebhook from './edit_outgoing_webhook';

type OwnProps = {
    location: {
        search: string | string[][] | Record<string, string> | URLSearchParams | undefined;
    };
}

type Actions = {
    updateOutgoingHook: (hook: OutgoingWebhook) => Promise<{ data: OutgoingWebhook; error: ServerError }>;
    getOutgoingHook: (hookId: string) => Promise<{ data: OutgoingWebhook; error: ServerError }>;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const hookId = (new URLSearchParams(ownProps.location.search)).get('id');
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';
    const enablePostIconOverride = config.EnablePostIconOverride === 'true';

    return {
        hookId: hookId!,
        hook: state.entities.integrations.outgoingHooks[hookId!],
        enableOutgoingWebhooks,
        enablePostUsernameOverride,
        enablePostIconOverride,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            updateOutgoingHook,
            getOutgoingHook,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditOutgoingWebhook);
