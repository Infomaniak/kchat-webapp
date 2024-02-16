// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile as UserProfileRedux} from '@mattermost/types/users';

import {Permissions} from 'mattermost-redux/constants';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal';
import AtMention from 'components/at_mention';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import LocalizedIcon from 'components/localized_icon';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import ProfilePicture from 'components/profile_picture';
import ToggleModalButton from 'components/toggle_modal_button';
import UserProfile from 'components/user_profile';
import EditIcon from 'components/widgets/icons/fa_edit_icon';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {getMonthLong, t} from 'utils/i18n';
import * as Utils from 'utils/utils';

import AddMembersButton from './add_members_button';
import PluggableIntroButtons from './pluggable_intro_buttons';

type Props = {
    currentUserId: string;
    channel: Channel;
    fullWidth: boolean;
    locale: string;
    channelProfiles: UserProfileRedux[];
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    teamIsGroupConstrained?: boolean;
    creatorName: string;
    teammate?: UserProfileRedux;
    teammateName?: string;
    stats: any;
    usersLimit: number;
    isChannelMember?: boolean;
    actions: {
        getTotalUsersStats: () => any;
    };
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    componentDidMount() {
        if (!this.props.stats?.total_users_count) {
            this.props.actions.getTotalUsersStats();
        }
    }
    render() {
        const {
            currentUserId,
            channel,
            creatorName,
            fullWidth,
            locale,
            enableUserCreation,
            isReadOnly,
            channelProfiles,
            teamIsGroupConstrained,
            teammate,
            teammateName,
            stats,
            usersLimit,
            isChannelMember,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro, teammate, teammateName);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, channelProfiles, currentUserId);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, stats, usersLimit, enableUserCreation, isReadOnly, teamIsGroupConstrained);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro, stats, usersLimit);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, stats, usersLimit, locale, creatorName, isChannelMember);
        }
        return null;
    }
}

function createGMIntroMessage(channel: Channel, centeredIntro: string, profiles: UserProfileRedux[], currentUserId: string) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile.id, profile.last_picture_update)}
                    size='xl'
                    userId={profile.id}
                    username={profile.username}
                />
            ));

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    {pictures}
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.GM'
                        defaultMessage='This is the start of your group message history with {names}.\nMessages and files shared here are not shown to people outside this area.'
                        values={{
                            names: channel.display_name,
                        }}
                    />
                </p>
                <PluggableIntroButtons channel={channel}/>
                {createSetHeaderButton(channel)}
            </div>
        );
    }

    return (
        <div
            id={channelIntroId}
            className={'channel-intro ' + centeredIntro}
        >
            <p className='channel-intro-text'>
                <FormattedMessage
                    id='intro_messages.group_message'
                    defaultMessage='This is the start of your group message history with these teammates. Messages and files shared here are not shown to people outside this area.'
                />
            </p>
        </div>
    );
}

function createDMIntroMessage(channel: Channel, centeredIntro: string, teammate?: UserProfileRedux, teammateName?: string) {
    const channelIntroId = 'channelIntro';
    if (teammate) {
        const src = teammate ? Utils.imageURLForUser(teammate.id, teammate.last_picture_update) : '';

        let pluggableButton = null;
        let setHeaderButton = null;
        if (!teammate?.is_bot) {
            pluggableButton = <PluggableIntroButtons channel={channel}/>;
            setHeaderButton = createSetHeaderButton(channel);
        }

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={src}
                        size='xl'
                        userId={teammate?.id}
                        username={teammate?.username}
                        hasMention={true}
                    />
                </div>
                <div className='channel-intro-profile d-flex'>
                    <UserProfile
                        userId={teammate?.id}
                        disablePopover={false}
                        hasMention={true}
                    />
                </div>
                <p className='channel-intro-text'>
                    <FormattedMarkdownMessage
                        id='intro_messages.DM'
                        defaultMessage='This is the start of your direct message history with {teammate}.\nDirect messages and files shared here are not shown to people outside this area.'
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                {pluggableButton}
                {setHeaderButton}
                {teammate?.username === 'chat.gpt' ? (
                    <p className='channel-limitation-banner'>
                        <span style={{alignSelf: 'baseline'}}>
                            <i className='icon-information-outline'/>
                        </span>
                        <FormattedMessage
                            id='intro_messages.botGPT'
                            values={{
                                limit: 100,
                                day: 23,
                                botName: 'kchat.bot',
                                mention: (chunks: React.ReactNode) => (
                                    <AtMention
                                        key={'kchat.bot'}
                                        mentionName={'kchat.bot'}
                                        channelId={channel.id}
                                    >{'@'}{chunks}</AtMention>
                                ),
                            }}
                            defaultMessage='{limit} daily ChatGPT queries are included with kChat for free until {day} November to let you test the power of <mention>{botName}</mention>. With our AI, the data is processed exclusively in Switzerland on Infomaniak’s servers. Using ChatGPT, the data is sent and analysed on OpenAI servers in the United States. We advise you not to share sensitive information with ChatGPT and remind you that AI may generate inaccurate information about people, places or facts.'
                        />
                    </p>
                ) : null}
                {teammate?.username === 'kchat.bot' ? (
                    <p className='channel-limitation-banner'>
                        <span style={{alignSelf: 'baseline'}}>
                            <i className='icon-information-outline'/>
                        </span>
                        <FormattedMessage
                            id='intro_messages.botFalcon'
                            values={{
                                botName: 'kchat.bot',
                                mention: (chunks: React.ReactNode) => (
                                    <AtMention
                                        key={'kchat.bot'}
                                        mentionName={'kchat.bot'}
                                        channelId={channel.id}
                                    >{'@'}{chunks}</AtMention>
                                ),
                            }}
                            defaultMessage='<mention>{botName}</mention> is a sovereign AI. The data is processed exclusively in Switzerland on Infomaniak’s servers. We remind you that the information generated by <mention>{botName}</mention> and AI may be inaccurate, incomplete or misleading.'
                        />
                    </p>
                ) : null}
            </div>
        );
    }

    return (
        <div
            id={channelIntroId}
            className={'channel-intro ' + centeredIntro}
        >
            <p className='channel-intro-text'>
                <FormattedMessage
                    id='intro_messages.teammate'
                    defaultMessage='This is the start of your direct message history with this teammate. Direct messages and files shared here are not shown to people outside this area.'
                />
            </p>
        </div>
    );
}

function createOffTopicIntroMessage(channel: Channel, centeredIntro: string, stats: any, usersLimit: number) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const children = createSetHeaderButton(channel);
    const totalUsers = stats.total_users_count;

    let setHeaderButton = null;
    if (children) {
        setHeaderButton = (
            <ChannelPermissionGate
                teamId={channel.team_id}
                channelId={channel.id}
                permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
            >
                {children}
            </ChannelPermissionGate>
        );
    }

    const channelInviteButton = (
        <AddMembersButton
            setHeader={setHeaderButton}
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            pluginButtons={<PluggableIntroButtons channel={channel}/>}
        />
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                <FormattedMessage
                    id='intro_messages.offTopic'
                    defaultMessage='This is the start of {display_name}, a channel for non-work-related conversations.'
                    values={{
                        display_name: channel.display_name,
                    }}
                />
            </p>
            {channelInviteButton}
        </div>
    );
}

export function createDefaultIntroMessage(
    channel: Channel,
    centeredIntro: string,
    stats: any,
    usersLimit: number,
    enableUserCreation?: boolean,
    isReadOnly?: boolean,
    teamIsGroupConstrained?: boolean,
) {
    let teamInviteLink = null;
    const totalUsers = stats.total_users_count;
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    let setHeaderButton = null;
    let pluginButtons = null;
    if (!isReadOnly) {
        pluginButtons = <PluggableIntroButtons channel={channel}/>;
        const children = createSetHeaderButton(channel);
        if (children) {
            setHeaderButton = (
                <ChannelPermissionGate
                    teamId={channel.team_id}
                    channelId={channel.id}
                    permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
                >
                    {children}
                </ChannelPermissionGate>
            );
        }
    }

    if (!isReadOnly && enableUserCreation) {
        teamInviteLink = (
            <TeamPermissionGate
                teamId={channel.team_id}
                permissions={[Permissions.INVITE_USER]}
            >
                <TeamPermissionGate
                    teamId={channel.team_id}
                    permissions={[Permissions.ADD_USER_TO_TEAM]}
                >
                    {!teamIsGroupConstrained &&
                        <AddMembersButton
                            setHeader={setHeaderButton}
                            totalUsers={totalUsers}
                            usersLimit={usersLimit}
                            channel={channel}
                            pluginButtons={pluginButtons}
                        />
                    }
                    {teamIsGroupConstrained &&
                    <ToggleModalButton
                        className='intro-links color--link'
                        modalId={ModalIdentifiers.ADD_GROUPS_TO_TEAM}
                        dialogType={AddGroupsToTeamModal}
                        dialogProps={{channel}}
                    >
                        <LocalizedIcon
                            className='fa fa-user-plus'
                            title={{id: t('generic_icons.add'), defaultMessage: 'Add Icon'}}
                        />
                        <FormattedMessage
                            id='intro_messages.addGroupsToTeam'
                            defaultMessage='Add other groups to this team'
                        />
                    </ToggleModalButton>
                    }
                </TeamPermissionGate>
            </TeamPermissionGate>
        );
    }

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: channel.display_name,
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                {!isReadOnly &&
                    <FormattedMarkdownMessage
                        id='intro_messages.default'
                        defaultMessage='**Welcome to {display_name}!**\n \nPost messages here that you want everyone to see. Everyone automatically becomes a permanent member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
                {isReadOnly &&
                    <FormattedMarkdownMessage
                        id='intro_messages.readonly.default'
                        defaultMessage='**Welcome to {display_name}!**\n \nMessages can only be posted by system admins. Everyone automatically becomes a permanent member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
            </p>
            {teamInviteLink}
            {teamIsGroupConstrained && pluginButtons}
            {teamIsGroupConstrained && setHeaderButton}
            <br/>
        </div>
    );
}

function createStandardIntroMessage(channel: Channel, centeredIntro: string, stats: any, usersLimit: number, locale: string, creatorName: string, isChannelMember = true) {
    const uiName = channel.display_name;
    let memberMessage;
    const channelIsArchived = channel.delete_at !== 0;
    const totalUsers = stats.total_users_count;

    if (!isChannelMember) { // [Preview mode] if the user is not a member, we change the standard message and remove the add users action.
        return (
            <div
                id='channelIntro'
                className={'channel-intro ' + centeredIntro}
            >
                <h2 className='channel-intro__title'>
                    <FormattedMessage
                        id='intro_messages.preview'
                        defaultMessage='Preview of {name}'
                        values={{
                            name: (uiName),
                        }}
                    />
                </h2>
            </div>
        );
    }

    if (channelIsArchived) {
        memberMessage = '';
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.onlyInvited'
                defaultMessage=' Only invited members can see this private channel.'
            />
        );
    } else {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.anyMember'
                defaultMessage=' Any member can join and read this channel.'
            />
        );
    }

    const date = (
        <FormattedDate
            value={channel.create_at}
            month={getMonthLong(locale)}
            day='2-digit'
            year='numeric'
        />
    );

    let createMessage;
    if (creatorName === '') {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            createMessage = (
                <FormattedMessage
                    id='intro_messages.noCreatorPrivate'
                    defaultMessage='This is the start of the {name} private channel, created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            createMessage = (
                <FormattedMessage
                    id='intro_messages.noCreator'
                    defaultMessage='This is the start of the {name} channel, created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        }
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creatorPrivate'
                    defaultMessage='This is the start of the {name} private channel, created by {creator} on {date}.'
                    values={{
                        name: (uiName),
                        creator: (creatorName),
                        date,
                    }}
                />
            </span>
        );
    } else if (channel.type === Constants.OPEN_CHANNEL) {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creator'
                    defaultMessage='This is the start of the {name} channel, created by {creator} on {date}.'
                    values={{
                        name: (uiName),
                        creator: (creatorName),
                        date,
                    }}
                />
            </span>
        );
    }

    let purposeMessage;
    if (channel.purpose && channel.purpose !== '') {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            purposeMessage = (
                <span>
                    <FormattedMessage
                        id='intro_messages.purposePrivate'
                        defaultMessage=" This private channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            purposeMessage = (
                <span>
                    <FormattedMessage
                        id='intro_messages.purpose'
                        defaultMessage=" This channel's purpose is: {purpose}"
                        values={{purpose: channel.purpose}}
                    />
                </span>
            );
        }
    }

    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    let setHeaderButton = null;
    const children = createSetHeaderButton(channel);
    if (children) {
        setHeaderButton = (
            <ChannelPermissionGate
                teamId={channel.team_id}
                channelId={channel.id}
                permissions={[isPrivate ? Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES : Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]}
            >
                {children}
            </ChannelPermissionGate>
        );
    }

    const channelInviteButton = (
        <AddMembersButton
            totalUsers={totalUsers}
            usersLimit={usersLimit}
            channel={channel}
            setHeader={setHeaderButton}
            pluginButtons={<PluggableIntroButtons channel={channel}/>}
        />
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <h2 className='channel-intro__title'>
                <FormattedMessage
                    id='intro_messages.beginning'
                    defaultMessage='Beginning of {name}'
                    values={{
                        name: (uiName),
                    }}
                />
            </h2>
            <p className='channel-intro__content'>
                {createMessage}
                {memberMessage}
                {purposeMessage}
                <br/>
            </p>
            {channelInviteButton}
        </div>
    );
}

function createSetHeaderButton(channel: Channel) {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    return (
        <ToggleModalButton
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            ariaLabel={Utils.localizeMessage('intro_messages.setHeader', 'Set a Header')}
            className={'intro-links color--link channelIntroButton'}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <EditIcon/>
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set a Header'
            />
        </ToggleModalButton>
    );
}
