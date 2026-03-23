// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {OutgoingWebhook} from '@mattermost/types/integrations';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';
import type {IDMappedObjects} from '@mattermost/types/utilities';

import type {ActionResult} from 'mattermost-redux/types/actions';

import InstalledOutgoingWebhook, {matchesFilter, matchCreator} from 'components/integrations/installed_outgoing_webhook';

import {Constants} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

export type Props = {

    /**
    *  Data used in passing down as props for webhook modifications
    */
    team: Team;

    /**
    * Data used for checking if webhook is created by current user
    */
    user: UserProfile;

    /**
    *  Data used for checking modification privileges
    */
    canManageOthersWebhooks: boolean;

    /**
    * Data used in passing down as props for showing webhook details
    */
    outgoingWebhooks: OutgoingWebhook[];

    /**
    * Data used in sorting for displaying list and as props channel details
    */
    channels: IDMappedObjects<Channel>;

    /**
    *  Data used in passing down as props for webhook -created by label
    */
    users: IDMappedObjects<UserProfile>;

    /**
    *  Data used in passing as argument for loading webhooks
    */
    teamId: string;

    /**
    *  Wether or not user is capped with limitation
    */
    isQuotaExceeded: boolean;

    actions: {

        /**
        * The function to call for removing outgoingWebhook
        */
        removeOutgoingHook: (hookId: string) => Promise<ActionResult>;

        /**
        * The function to call for outgoingWebhook List and for the status of api
        */
        loadOutgoingHooksAndProfilesForTeam: (teamId: string, page: number, perPage: number) => Promise<ActionResult>;

        /**
        * The function to call for regeneration of webhook token
        */
        regenOutgoingHookToken: (hookId: string) => Promise<ActionResult>;
    };

    /**
    * Whether or not outgoing webhooks are enabled.
    */
    enableOutgoingWebhooks: boolean;
}

type State = {
    loading: boolean;
};

export default class InstalledOutgoingWebhooks extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableOutgoingWebhooks) {
            this.props.actions.loadOutgoingHooksAndProfilesForTeam(
                this.props.teamId,
                Constants.Integrations.START_PAGE_NUM,
                Constants.Integrations.PAGE_SIZE,
            ).then(
                () => this.setState({loading: false}),
            );
        }
    }

    regenOutgoingWebhookToken = (outgoingWebhook: OutgoingWebhook) => {
        this.props.actions.regenOutgoingHookToken(outgoingWebhook.id);
    };

    removeOutgoingHook = (outgoingWebhook: OutgoingWebhook) => {
        this.props.actions.removeOutgoingHook(outgoingWebhook.id);
    };

    outgoingWebhookCompare = (a: OutgoingWebhook, b: OutgoingWebhook) => {
        let displayNameA = a.display_name;
        if (!displayNameA) {
            const channelA = this.props.channels[a.channel_id];
            if (channelA) {
                displayNameA = channelA.display_name;
            } else {
                displayNameA = localizeMessage({id: 'installed_outgoing_webhooks.unknown_channel', defaultMessage: 'A Private Webhook'});
            }
        }

        let displayNameB = b.display_name;
        if (!displayNameB) {
            const channelB = this.props.channels[b.channel_id];
            if (channelB) {
                displayNameB = channelB.display_name;
            } else {
                displayNameB = localizeMessage({id: 'installed_outgoing_webhooks.unknown_channel', defaultMessage: 'A Private Webhook'});
            }
        }
        return displayNameA.localeCompare(displayNameB);
    };

    outgoingWebhooks = (filter: string) => this.props.outgoingWebhooks.
        sort(this.outgoingWebhookCompare).
        filter((outgoingWebhook) => {
            const creator = this.props.users[outgoingWebhook.creator_id];

            return matchCreator(creator, filter) || // Ik change : also match the creator username
               matchesFilter(outgoingWebhook, this.props.channels[outgoingWebhook.channel_id], filter);
        }).
        map((outgoingWebhook) => {
            const canChange = this.props.canManageOthersWebhooks || this.props.user.id === outgoingWebhook.creator_id;
            const channel = this.props.channels[outgoingWebhook.channel_id];
            return (
                <InstalledOutgoingWebhook
                    key={outgoingWebhook.id}
                    outgoingWebhook={outgoingWebhook}
                    onRegenToken={this.regenOutgoingWebhookToken}
                    onDelete={this.removeOutgoingHook}
                    creator={this.props.users[outgoingWebhook.creator_id] || {}}
                    canChange={canChange}
                    team={this.props.team}
                    channel={channel}
                />
            );
        });

    render() {
        const webhookList = this.outgoingWebhooks('');
        return (
            <div className='backstage-content'>
                <div className='backstage-header'>
                    <FormattedMessage
                        id='installed_outgoing_webhooks.header'
                        defaultMessage='Installed Outgoing Webhooks'
                    />
                </div>
                {webhookList}
            </div>
        );
    }
}
