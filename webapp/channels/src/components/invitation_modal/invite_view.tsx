// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, defineMessages, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {Team} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {getNextWcPack, openUpgradeDialog} from 'mattermost-redux/utils/plans_util';

import UsersEmailsInput from 'components/widgets/inputs/users_emails_input';

import {Constants} from 'utils/constants';

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
    currentChannel?: Channel;
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
    remainingGuestSlot?: number;
    canAddUsers: boolean;
    townSquareDisplayName: string;
    channelToInvite?: Channel;
    onPaste?: (e: ClipboardEvent) => void;
    shouldOpenMenu: boolean;
}

export default function InviteView(props: Props) {
    const intl = useIntl();
    const isGuestQuotaExceeded = (props.inviteType === InviteType.GUEST) && (props.remainingGuestSlot! + props.usersEmails.length) > 0;
    const currentPack = useSelector(getCurrentPackName);
    const nextPlan = getNextWcPack(currentPack);

    useEffect(() => {
        if (!props.currentTeam.invite_id) {
            props.regenerateTeamInviteId(props.currentTeam.id);
        }
    }, [props.currentTeam.id, props.currentTeam.invite_id, props.regenerateTeamInviteId]);

    const {formatMessage} = useIntl();

    const errorProperties: {showError: boolean; errorMessage: {id: string; defaultMessage: string}; errorMessageValues: Record<string, any>} = {
        showError: false,
        errorMessage: messages.exceededMaxBatch,
        errorMessageValues: {
            text: Constants.MAX_ADD_MEMBERS_BATCH.toString(),
        },
    };

    if (props.usersEmails.length > Constants.MAX_ADD_MEMBERS_BATCH) {
        errorProperties.showError = true;
    }

    if (isGuestQuotaExceeded) {
        const upgradeText = intl.formatMessage({id: 'upgrade.offer', defaultMessage: 'upgrade your plan'});

        errorProperties.showError = true;
        errorProperties.errorMessage = messages.exceededGuestSlot;
        errorProperties.errorMessageValues = {
            count: props.remainingGuestSlot! * -1,
            action: (
                <a
                    href='#'
                    onClick={() => openUpgradeDialog(nextPlan)}
                >{upgradeText}</a>
            ),
        };
    }

    let placeholder;
    let noMatchMessage;
    if (props.emailInvitationsEnabled) {
        placeholder = props.inviteType === InviteType.GUEST ? formatMessage({
            id: 'invite_modal.add_invites.email',
            defaultMessage: 'Enter an email address',
        }) : formatMessage({
            id: 'invite_modal.add_invites',
            defaultMessage: 'Enter a name or email address',
        });
        noMatchMessage = messages.noUserFound;
    } else {
        placeholder = formatMessage({
            id: 'invitation_modal.members.search-and-add.placeholder-email-disabled',
            defaultMessage: 'Add members',
        });
        noMatchMessage = messages.noUserFoundEmailDisabled;
    }

    let validAddressMessage;
    if (props.inviteType === InviteType.MEMBER) {
        validAddressMessage = messages.validAddressMember;
    } else {
        validAddressMessage = messages.validAddressGuest;
    }

    const isInviteValid = useMemo(() => {
        if (props.inviteType === InviteType.GUEST) {
            if (isGuestQuotaExceeded) {
                return false;
            }
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
            <Modal.Header className={props.headerClass}>
                <h1
                    id='invitation_modal_title'
                    className='modal-title'
                >
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
                <button
                    id='closeIcon'
                    className='icon icon-close close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onClose}
                />
            </Modal.Header>
            <Modal.Body className='overflow-visible'>
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
                    validAddressMessage={validAddressMessage}
                    noMatchMessage={noMatchMessage}
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
                    data-testid={'inviteButton'}
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

const messages = defineMessages({
    exceededMaxBatch: {
        id: 'invitation_modal.invite_members.exceeded_max_add_members_batch',
        defaultMessage: 'No more than **{text}** people can be invited at once',
    },
    noUserFound: {
        id: 'invitation_modal.members.users_emails_input.no_user_found_matching',
        defaultMessage: 'No one found matching **{text}**. Enter their email to invite them.',
    },
    noUserFoundEmailDisabled: {
        id: 'invitation_modal.members.users_emails_input.no_user_found_matching-email-disabled',
        defaultMessage: 'No one found matching **{text}**',
    },
    validAddressGuest: {
        id: 'invitation_modal.guests.users_emails_input.valid_email',
        defaultMessage: 'Invite **{email}** as a guest',
    },
    validAddressMember: {
        id: 'invitation_modal.members.users_emails_input.valid_email',
        defaultMessage: 'Invite **{email}** as a team member',
    },
    exceededGuestSlot: {
        id: 'invitation_modal.invite_members.exceeded_max_guest',
        defaultMessage: 'There are {count} external invitations remaining. Remove users or {action}.',
    },
});
