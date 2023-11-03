// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import {Constants} from 'utils/constants';
import {t} from 'utils/i18n';

import type {Channel} from '@mattermost/types/channels';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';

import type {CustomMessageProps, InviteChannels} from './add_to_channels';
import AddToChannels, {defaultCustomMessage, defaultInviteChannels} from './add_to_channels';
import InviteAs, {InviteType} from './invite_as';
import OverageUsersBannerNotice from './overage_users_banner_notice';

import './invite_view.scss';

export const initializeInviteState = (initialSearchValue = '', inviteAsGuest = false): InviteState => {
    return deepFreeze({
        inviteType: inviteAsGuest ? InviteType.GUEST : InviteType.MEMBER,
        customMessage: defaultCustomMessage,
        inviteChannels: defaultInviteChannels,
        usersEmails: [],
        usersEmailsSearch: initialSearchValue,
    });
};

export type InviteState = {
    customMessage: CustomMessageProps;
    inviteType: InviteType;
    inviteChannels: InviteChannels;
    usersEmails: Array<UserProfile | string>;
    usersEmailsSearch: string;
};

export type Props = InviteState & {
    setInviteAs: (inviteType: InviteType) => void;
    invite: () => void;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (channelsInputValue: string) => void;
    onClose: () => void;
    currentTeam: Team;
    currentChannel: Channel;
    setCustomMessage: (message: string) => void;
    toggleCustomMessage: () => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
    regenerateTeamInviteId: (teamId: string) => void;
    isAdmin: boolean;
    usersLoader: (value: string, callback: (users: UserProfile[]) => void) => Promise<UserProfile[]> | undefined;
    onChangeUsersEmails: (usersEmails: Array<UserProfile | string>) => void;
    isCloud: boolean;
    emailInvitationsEnabled: boolean;
    onUsersInputChange: (usersEmailsSearch: string) => void;
    headerClass: string;
    footerClass: string;
    canInviteGuests: boolean;
    canAddUsers: boolean;
    townSquareDisplayName: string;
    channelToInvite?: Channel;
    onPaste?: (e: ClipboardEvent) => void;
    shouldOpenMenu: boolean;
}

export default function InviteView(props: Props) {
    useEffect(() => {
        if (!props.currentTeam.invite_id) {
            props.regenerateTeamInviteId(props.currentTeam.id);
        }
    }, [props.currentTeam.id, props.currentTeam.invite_id, props.regenerateTeamInviteId]);

    const {formatMessage} = useIntl();

    const errorProperties = {
        showError: false,
        errorMessageId: '',
        errorMessageDefault: '',
        errorMessageValues: {
            text: '',
        },
        extraErrorText: '',
    };

    if (props.usersEmails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;
        errorProperties.errorMessageId = t(
            'invitation_modal.invite_members.exceeded_max_add_members_batch',
        );
        errorProperties.errorMessageDefault = 'No more than **{text}** people can be invited at once';
        errorProperties.errorMessageValues.text = Constants.MAX_ADD_MEMBERS_BATCH.toString();
    }

    let placeholder = props.inviteType === InviteType.GUEST ? formatMessage({
        id: 'invite_modal.add_invites.email',
        defaultMessage: 'Enter an email address',
    }) : formatMessage({
        id: 'invite_modal.add_invites',
        defaultMessage: 'Enter a name or email address',
    });
    let noMatchMessageId = t(
        'invitation_modal.members.users_emails_input.no_user_found_matching',
    );
    let noMatchMessageDefault =
        'No one found matching **{text}**. Enter their email to invite them.';

    if (!props.emailInvitationsEnabled) {
        placeholder = formatMessage({
            id: 'invitation_modal.members.search-and-add.placeholder-email-disabled',
            defaultMessage: 'Add members',
        });
        noMatchMessageId = t(
            'invitation_modal.members.users_emails_input.no_user_found_matching-email-disabled',
        );
        noMatchMessageDefault = 'No one found matching **{text}**';
    }

    const isInviteValid = useMemo(() => {
        if (props.inviteType === InviteType.GUEST) {
            return props.inviteChannels.channels.length > 0 && props.usersEmails.length > 0;
        }
        return props.usersEmails.length > 0;
    }, [props.inviteType, props.inviteChannels.channels, props.usersEmails]);

    const inviteModalPeople = formatMessage({
        id: 'invite_modal.people',
        defaultMessage: 'people',
    });

    const inviteModalGuest = formatMessage({
        id: 'invite_modal.guests',
        defaultMessage: 'guests',
    });

    return (
        <>
            <Modal.Header
                closeButton={true}
                className={props.headerClass}
            >
                <h1 id='invitation_modal_title'>
                    <FormattedMessage
                        id='invite_modal.title'
                        defaultMessage={'Invite {inviteType} to {team_name}'}
                        values={{
                            inviteType: (
                                props.inviteType === InviteType.MEMBER ? inviteModalPeople : inviteModalGuest
                            ),
                            team_name: props.currentTeam.display_name,
                        }}
                    />
                </h1>
            </Modal.Header>
            <Modal.Body>
                <div className='InviteView__sectionTitle InviteView__sectionTitle--first'>
                    <FormattedMessage
                        id='invite_modal.to'
                        defaultMessage='To:'
                    />
                </div>
                <UsersEmailsInput
                    {...errorProperties}
                    usersLoader={props.usersLoader}
                    placeholder={placeholder}
                    ariaLabel={formatMessage({
                        id: 'invitation_modal.members.search_and_add.title',
                        defaultMessage: 'Invite People',
                    })}
                    onChange={(usersEmails: Array<UserProfile | string>) => {
                        props.onChangeUsersEmails(usersEmails);
                    }}
                    value={props.usersEmails}
                    validAddressMessageId={props.inviteType === InviteType.MEMBER ? t(
                        'invitation_modal.members.users_emails_input.valid_email',
                    ) : t('invitation_modal.guests.users_emails_input.valid_email')}
                    validAddressMessageDefault={props.inviteType === InviteType.MEMBER ? 'Invite **{email}** as a team member' : 'Invite **{email}** as a guest'}
                    noMatchMessageId={noMatchMessageId}
                    noMatchMessageDefault={noMatchMessageDefault}
                    onInputChange={props.onUsersInputChange}
                    inputValue={props.usersEmailsSearch}
                    emailInvitationsEnabled={props.emailInvitationsEnabled}
                    autoFocus={true}
                    onPaste={props.onPaste}
                    isMenuOpen={props.shouldOpenMenu}
                />
                {props.canInviteGuests && props.canAddUsers &&
                <InviteAs
                    inviteType={props.inviteType}
                    setInviteAs={props.setInviteAs}
                    titleClass='InviteView__sectionTitle'
                />
                }
                {(props.inviteType === InviteType.GUEST || (props.inviteType === InviteType.MEMBER && props.channelToInvite)) && (
                    <AddToChannels
                        setCustomMessage={props.setCustomMessage}
                        toggleCustomMessage={props.toggleCustomMessage}
                        customMessage={props.customMessage}
                        onChannelsChange={props.onChannelsChange}
                        onChannelsInputChange={props.onChannelsInputChange}
                        inviteChannels={props.inviteChannels}
                        channelsLoader={props.channelsLoader}
                        currentChannel={props.currentChannel}
                        townSquareDisplayName={props.townSquareDisplayName}
                        titleClass='InviteView__sectionTitle'
                        channelToInvite={props.channelToInvite}
                        inviteType={props.inviteType}
                    />
                )}
                <OverageUsersBannerNotice/>
            </Modal.Body>
            <Modal.Footer className={'InviteView__footer ' + props.footerClass}>
                <button
                    disabled={!isInviteValid}
                    onClick={props.invite}
                    className={'btn btn-primary'}
                    id={props.inviteType === InviteType.MEMBER ? 'inviteMembersButton' : 'inviteGuestButton'}
                >
                    <FormattedMessage
                        id='invite_modal.invite'
                        defaultMessage='Invite'
                    />
                </button>
            </Modal.Footer>
        </>
    );
}
