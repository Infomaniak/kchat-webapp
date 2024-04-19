// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {IncomingWebhook} from '@mattermost/types/integrations';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';
import type {IDMappedObjects} from '@mattermost/types/utilities';

import type {ActionResult} from 'mattermost-redux/types/actions';

import {redirectToDeveloperDocumentation} from 'actions/global_actions';

import BackstageList from 'components/backstage/components/backstage_list';
import ExternalLink from 'components/external_link';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import InstalledIncomingWebhook, {matchesFilter} from 'components/integrations/installed_incoming_webhook';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

type Props = {
    team: Team;
    user: UserProfile;
    canManageOthersWebhooks: boolean;
    incomingWebhooks: IncomingWebhook[];
    channels: IDMappedObjects<Channel>;
    users: IDMappedObjects<UserProfile>;
    enableIncomingWebhooks: boolean;
    actions: {
        removeIncomingHook: (hookId: string) => Promise<ActionResult>;
        loadIncomingHooksAndProfilesForTeam: (teamId: string, startPageNumber: number,
            pageSize: number) => Promise<ActionResult>;
    };
}

type State = {
    loading: boolean;
}

export default class InstalledIncomingWebhooks extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableIncomingWebhooks) {
            this.props.actions.loadIncomingHooksAndProfilesForTeam(
                this.props.team.id,
                Constants.Integrations.START_PAGE_NUM,
                Constants.Integrations.PAGE_SIZE,
            ).then(
                () => this.setState({loading: false}),
            );
        }
    }

    deleteIncomingWebhook = (incomingWebhook: IncomingWebhook) => {
        this.props.actions.removeIncomingHook(incomingWebhook.id);
    };

    incomingWebhookCompare = (a: IncomingWebhook, b: IncomingWebhook) => {
        let displayNameA = a.display_name;
        if (!displayNameA) {
            const channelA = this.props.channels[a.channel_id];
            if (channelA) {
                displayNameA = channelA.display_name;
            } else {
                displayNameA = Utils.localizeMessage('installed_incoming_webhooks.unknown_channel', 'A Private Webhook');
            }
        }

        const displayNameB = b.display_name;

        return displayNameA.localeCompare(displayNameB);
    };

    incomingWebhooks = (filter: string) => this.props.incomingWebhooks.
        sort(this.incomingWebhookCompare).
        filter((incomingWebhook: IncomingWebhook) => matchesFilter(incomingWebhook, this.props.channels[incomingWebhook.channel_id], filter)).
        map((incomingWebhook: IncomingWebhook) => {
            const canChange = this.props.canManageOthersWebhooks || this.props.user.id === incomingWebhook.user_id;
            const channel = this.props.channels[incomingWebhook.channel_id];
            return (
                <InstalledIncomingWebhook
                    key={incomingWebhook.id}
                    incomingWebhook={incomingWebhook}
                    onDelete={this.deleteIncomingWebhook}
                    creator={this.props.users[incomingWebhook.user_id] || {}}
                    canChange={canChange}
                    team={this.props.team}
                    channel={channel}
                />
            );
        });

    render() {
        return (
            <BackstageList
                header={
                    <FormattedMessage
                        id='installed_incoming_webhooks.header'
                        defaultMessage='Installed Incoming Webhooks'
                    />
                }
                addText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.add'
                        defaultMessage='Add Incoming Webhook'
                    />
                }
                addLink={'/' + this.props.team.name + '/integrations/incoming_webhooks/add'}
                addButtonId='addIncomingWebhook'
                emptyText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.empty'
                        defaultMessage='No incoming webhooks found'
                    />
                }
                emptyTextSearch={
                    <FormattedMarkdownMessage
                        id='installed_incoming_webhooks.emptySearch'
                        defaultMessage='No incoming webhooks match {searchTerm}'
                    />
                }
                helpText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.help'
                        defaultMessage='Use incoming webhooks to connect external tools to kChat. {learnMore}'
                        values={{
                            learnMore: (
                                <a onClick={redirectToDeveloperDocumentation}>
                                    <FormattedMessage
                                        id='developer_documentation.learn_more'
                                        defaultMessage='Learn more'
                                    />
                                </a>
                            ),
                        }}
                    />
                }
                searchPlaceholder={Utils.localizeMessage('installed_incoming_webhooks.search', 'Search Incoming Webhooks')}
                loading={this.state.loading}
            >
                {(filter: string) => {
                    const children = this.incomingWebhooks(filter);
                    return [children, children.length > 0];
                }}
            </BackstageList>
        );
    }
}
