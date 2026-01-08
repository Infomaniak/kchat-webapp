// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {BellRingOutlineIcon, GlobeIcon, PencilOutlineIcon, StarOutlineIcon, LockOutlineIcon, StarIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';

import type {Channel, ChannelMembership} from '@mattermost/types/channels';
import type {UserProfile as UserProfileType} from '@mattermost/types/users';

import {Permissions} from 'mattermost-redux/constants';

import AtMention from 'components/at_mention';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import EmptyStateThemeableSvg from 'components/common/svg_images_components/empty_state_themeable_svg';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import ProfilePicture from 'components/profile_picture';
import ToggleModalButton from 'components/toggle_modal_button';
import UserProfile from 'components/user_profile';

import {Constants, ModalIdentifiers} from 'utils/constants';
import {getMonthLong} from 'utils/i18n';
import * as Utils from 'utils/utils';

import AddMembersButton from './add_members_button';
import PluggableIntroButtons from './pluggable_intro_buttons';

type Props = {
    currentUserId: string;
    channel?: Channel;
    fullWidth: boolean;
    locale: string;
    channelProfiles: UserProfileType[];
    enableUserCreation?: boolean;
    isReadOnly?: boolean;
    isFavorite: boolean;
    teamIsGroupConstrained?: boolean;
    creatorName: string;
    teammate?: UserProfileType;
    teammateName?: string;
    currentUser: UserProfileType;
    isChannelMember?: boolean;
    channelMember?: ChannelMembership;
    isMobileView: boolean;
    actions: {
        favoriteChannel: (channelId: string) => any;
        unfavoriteChannel: (channelId: string) => any;
    };
}

export default class ChannelIntroMessage extends React.PureComponent<Props> {
    toggleFavorite = () => {
        if (!this.props.channel) {
            return;
        }

        if (this.props.isFavorite) {
            this.props.actions.unfavoriteChannel(this.props.channel.id);
        } else {
            this.props.actions.favoriteChannel(this.props.channel.id);
        }
    };

    render() {
        const {
            currentUserId,
            channel,
            fullWidth,
            locale,
            channelProfiles,
            enableUserCreation,
            isReadOnly,
            isFavorite,
            teamIsGroupConstrained,
            creatorName,
            teammate,
            teammateName,
            currentUser,
            isChannelMember,
            isMobileView,
        } = this.props;

        let centeredIntro = '';
        if (!fullWidth) {
            centeredIntro = 'channel-intro--centered';
        }

        if (!channel) {
            return null;
        }

        if (channel.type === Constants.DM_CHANNEL) {
            return createDMIntroMessage(channel, centeredIntro, currentUser, isFavorite, isMobileView, this.toggleFavorite, teammate, teammateName);
        } else if (channel.type === Constants.GM_CHANNEL) {
            return createGMIntroMessage(channel, centeredIntro, isFavorite, isMobileView, this.toggleFavorite, channelProfiles, currentUserId, currentUser);
        } else if (channel.name === Constants.DEFAULT_CHANNEL) {
            return createDefaultIntroMessage(channel, centeredIntro, currentUser, isFavorite, isMobileView, this.toggleFavorite, enableUserCreation, isReadOnly, teamIsGroupConstrained);
        } else if (channel.name === Constants.OFFTOPIC_CHANNEL) {
            return createOffTopicIntroMessage(channel, centeredIntro, isFavorite, isMobileView, currentUser, this.toggleFavorite);
        } else if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            return createStandardIntroMessage(channel, centeredIntro, currentUser, isFavorite, isMobileView, this.toggleFavorite, locale, creatorName, isChannelMember);
        }
        return null;
    }
}

function createGMIntroMessage(
    channel: Channel,
    centeredIntro: string,
    isFavorite: boolean,
    isMobileView: boolean,
    toggleFavorite: () => void,
    profiles: UserProfileType[],
    currentUserId: string,
    currentUser: UserProfileType,
) {
    const channelIntroId = 'channelIntro';

    if (profiles.length > 0) {
        const pictures = profiles.
            filter((profile) => profile.id !== currentUserId).
            map((profile) => (
                <ProfilePicture
                    key={'introprofilepicture' + profile.id}
                    src={Utils.imageURLForUser(profile.id, profile.last_picture_update)}
                    size='xl-custom-GM'
                    userId={profile.id}
                    username={profile.username}
                />
            ));

        const actionButtons = (
            <div className='channel-intro__actions'>
                {createFavoriteButton(isFavorite, toggleFavorite)}
                {createSetHeaderButton(channel)}
                {!isMobileView && createNotificationPreferencesButton(channel, currentUser)}
                <PluggableIntroButtons channel={channel}/>
            </div>
        );

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img channel-intro-img__group'>
                    {pictures}
                </div>
                <h2 className='channel-intro__title'>
                    {channel.display_name}
                </h2>
                <p className='channel-intro__text'>
                    <FormattedMessage
                        id='intro_messages.group_message'
                        defaultMessage={'This is the start of your group message history with these teammates. '}
                    />
                </p>
                {actionButtons}
            </div>
        );
    }

    return (
        <div
            id={channelIntroId}
            className={'channel-intro ' + centeredIntro}
        >
            <p className='channel-intro__text'>
                <FormattedMessage
                    id='intro_messages.group_message'
                    defaultMessage='This is the start of your group message history with these teammates. Messages and files shared here are not shown to people outside this area.'
                />
            </p>
        </div>
    );
}

function createDMIntroMessage(
    channel: Channel,
    centeredIntro: string,
    currentUser: UserProfileType,
    isFavorite: boolean,
    isMobileView: boolean,
    toggleFavorite: () => void,
    teammate?: UserProfileType,
    teammateName?: string,
) {
    const channelIntroId = 'channelIntro';
    if (teammate) {
        const src = teammate ? Utils.imageURLForUser(teammate.id, teammate.last_picture_update) : '';

        let pluggableButton = null;
        let setHeaderButton = null;
        if (!teammate?.is_bot) {
            pluggableButton = <PluggableIntroButtons channel={channel}/>;
            setHeaderButton = createSetHeaderButton(channel);
        }

        const actionButtons = (
            <div className='channel-intro__actions'>
                {createFavoriteButton(isFavorite, toggleFavorite)}
                {setHeaderButton}
                {pluggableButton}
            </div>
        );

        return (
            <div
                id={channelIntroId}
                className={'channel-intro ' + centeredIntro}
            >
                <div className='post-profile-img__container channel-intro-img'>
                    <ProfilePicture
                        src={src}
                        size='xl-custom-DM'
                        status={teammate.is_bot ? '' : channel.status}
                        userId={teammate?.id}
                        username={teammate?.username}
                    />
                </div>
                <h2 className='channel-intro__title'>
                    <UserProfile
                        userId={teammate?.id}
                    />
                </h2>
                <p className='channel-intro__text'>
                    <FormattedMessage
                        id='intro_messages.DM'
                        defaultMessage='This is the start of your direct message history with {teammate}. Messages and files shared here are not shown to anyone else.'
                        values={{
                            teammate: teammateName,
                        }}
                    />
                </p>
                {actionButtons}
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
                                botName: 'euria',
                                mention: (chunks: React.ReactNode) => (
                                    <AtMention
                                        mentionName={'euria'}
                                        channelId={channel.id}
                                    >{'@'}{chunks}</AtMention>
                                ),
                            }}
                            defaultMessage='{limit} daily ChatGPT queries are included with kChat for free until {day} November to let you test the power of <mention>{botName}</mention>. With our AI, the data is processed exclusively in Switzerland on Infomaniak’s servers. Using ChatGPT, the data is sent and analysed on OpenAI servers in the United States. We advise you not to share sensitive information with ChatGPT and remind you that AI may generate inaccurate information about people, places or facts.'
                        />
                    </p>
                ) : null}
                {teammate?.username === 'euria' ? (
                    <p className='channel-limitation-banner'>
                        <span style={{alignSelf: 'baseline'}}>
                            <i className='icon-information-outline'/>
                        </span>
                        <FormattedMessage
                            id='intro_messages.botFalcon'
                            values={{
                                botName: 'euria',
                                mention: (chunks: React.ReactNode) => (
                                    <AtMention
                                        mentionName={'euria'}
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
            <p className='channel-intro__text'>
                <FormattedMessage
                    id='intro_messages.teammate'
                    defaultMessage='This is the start of your direct message history with this teammate. Messages and files shared here are not shown to anyone else.'
                />
            </p>
        </div>
    );
}

function createOffTopicIntroMessage(
    channel: Channel,
    centeredIntro: string,
    isFavorite: boolean,
    isMobileView: boolean,
    currentUser: UserProfileType,
    toggleFavorite: () => void,
) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const children = createSetHeaderButton(channel);

    let setHeaderButton = null;
    let actionButtons = null;

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

    actionButtons = (
        <div className='channel-intro__actions'>
            {createFavoriteButton(isFavorite, toggleFavorite)}
            {setHeaderButton}
            {createNotificationPreferencesButton(channel, currentUser)}
        </div>
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <EmptyStateThemeableSvg/>
            <h2 className='channel-intro__title'>
                {channel.display_name}
            </h2>
            <p className='channel-intro__text'>
                <FormattedMessage
                    id='intro_messages.offTopic'
                    defaultMessage='This is the start of {display_name}, a channel for non-work-related conversations.'
                    values={{
                        display_name: channel.display_name,
                    }}
                />
            </p>
            {actionButtons}
        </div>
    );
}

function createDefaultIntroMessage(
    channel: Channel,
    centeredIntro: string,
    currentUser: UserProfileType,
    isFavorite: boolean,
    isMobileView: boolean,
    toggleFavorite: () => void,
    enableUserCreation?: boolean,
    isReadOnly?: boolean,
    teamIsGroupConstrained?: boolean,
) {
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;

    let setHeaderButton = null;
    let pluginButtons = null;
    let actionButtons = null;

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

    actionButtons = (
        <div className='channel-intro__actions'>
            {createFavoriteButton(isFavorite, toggleFavorite)}
            {setHeaderButton}
            {createNotificationPreferencesButton(channel, currentUser)}
            {teamIsGroupConstrained && pluginButtons}
        </div>
    );

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <EmptyStateThemeableSvg/>
            <h2 className='channel-intro__title'>
                {channel.display_name}
            </h2>
            <p className='channel-intro__text'>
                {!isReadOnly &&
                    <FormattedMessage
                        id='intro_messages.default'
                        defaultMessage='Welcome to {display_name}. Post messages here that you want everyone to see. Everyone automatically becomes a member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
                {isReadOnly &&
                    <FormattedMessage
                        id='intro_messages.readonly.default'
                        defaultMessage='Welcome to {display_name}. Messages can only be posted by admins. Everyone automatically becomes a permanent member of this channel when they join the team.'
                        values={{
                            display_name: channel.display_name,
                        }}
                    />
                }
            </p>
            {actionButtons}
        </div>
    );
}

function createStandardIntroMessage(
    channel: Channel,
    centeredIntro: string,
    currentUser: UserProfileType,
    isFavorite: boolean,
    isMobileView: boolean,
    toggleFavorite: () => void,
    locale: string,
    creatorName: string,
    isChannelMember = true,
) {
    const uiName = channel.display_name;
    let memberMessage;
    let teamInviteLink = null;
    const channelIsArchived = channel.delete_at !== 0;

    if (channelIsArchived || !isChannelMember) { // [Preview mode] if the user is not a member, we change the standard message
        memberMessage = '';
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.onlyInvited'
                defaultMessage='This is the start of {display_name}. Only invited members can see this private channel.'
                values={{
                    display_name: channel.display_name,
                }}
            />
        );
    } else {
        memberMessage = (
            <FormattedMessage
                id='intro_messages.anyMember'
                defaultMessage='This is the start of {display_name}. Any team member can join and read this channel.'
                values={{
                    display_name: channel.display_name,
                }}
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
                    defaultMessage='Private channel created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            createMessage = (
                <FormattedMessage
                    id='intro_messages.noCreator'
                    defaultMessage='Public channel created on {date}.'
                    values={{name: (uiName), date}}
                />
            );
        }
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        createMessage = (
            <span>
                <FormattedMessage
                    id='intro_messages.creatorPrivate'
                    defaultMessage='Private channel created by {creator} on {date}.'
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
                    defaultMessage='Public channel created by {creator} on {date}.'
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

    teamInviteLink = (
        <AddMembersButton
            channel={channel}
            pluginButtons={<PluggableIntroButtons channel={channel}/>}
        />
    );

    let channelName;
    let actionButtons;
    if (isChannelMember) {
        actionButtons = (
            <div className='channel-intro__actions'>
                {createFavoriteButton(isFavorite, toggleFavorite)}
                {teamInviteLink}
                {setHeaderButton}
                {!isMobileView && createNotificationPreferencesButton(channel, currentUser)}
                <PluggableIntroButtons channel={channel}/>
            </div>
        );

        channelName = channel.display_name;
    } else { // [Preview mode] no action and more explicit channel name
        actionButtons = null;
        channelName = (
            <FormattedMessage
                id='intro_messages.preview'
                defaultMessage='Preview of {name}'
                values={{
                    name: (uiName),
                }}
            />
        );
    }

    return (
        <div
            id='channelIntro'
            className={'channel-intro ' + centeredIntro}
        >
            <EmptyStateThemeableSvg/>
            <h2 className='channel-intro__title'>
                {channelName}
            </h2>
            <div className='channel-intro__created'>
                {isPrivate ? <LockOutlineIcon size={14}/> : <GlobeIcon size={14}/>}
                {createMessage}
            </div>
            <p className='channel-intro__text'>
                {memberMessage}
                {purposeMessage}
            </p>
            {actionButtons}
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
            ariaLabel={Utils.localizeMessage({id: 'intro_messages.setHeader', defaultMessage: 'Set header'})}
            className={'action-button'}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <PencilOutlineIcon
                size={24}
            />
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set header'
            />
        </ToggleModalButton>
    );
}

function createFavoriteButton(isFavorite: boolean, toggleFavorite: () => void, classes?: string) {
    let favoriteText;
    if (isFavorite) {
        favoriteText = (
            <FormattedMessage
                id='channel_info_rhs.top_buttons.favorited'
                defaultMessage='Favorited'
            />);
    } else {
        favoriteText = (
            <FormattedMessage
                id='channel_info_rhs.top_buttons.favorite'
                defaultMessage='Favorite'
            />);
    }
    return (
        <button
            id='toggleFavoriteIntroButton'
            className={`action-button ${isFavorite ? 'active' : ''}  ${classes}`}
            onClick={toggleFavorite}
            aria-label={'Favorite'}
        >
            {isFavorite ? <StarIcon size={24}/> : <StarOutlineIcon size={24}/>}
            {favoriteText}
        </button>
    );
}

function createNotificationPreferencesButton(channel: Channel, currentUser: UserProfileType) {
    return (
        <ToggleModalButton
            id='channelIntroNotificationPreferencesButton'
            modalId={ModalIdentifiers.CHANNEL_NOTIFICATIONS}
            ariaLabel={Utils.localizeMessage({id: 'intro_messages.notificationPreferences', defaultMessage: 'Notification Preferences'})}
            className={'action-button'}
            dialogType={ChannelNotificationsModal}
            dialogProps={{channel, currentUser, focusOriginElement: 'channelIntroNotificationPreferencesButton'}}
        >
            <BellRingOutlineIcon size={24}/>
            <FormattedMessage
                id='intro_messages.notificationPreferences'
                defaultMessage='Notifications'
            />
        </ToggleModalButton>
    );
}
