// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import isEqual from 'lodash/isEqual';
import type {FC} from 'react';
import React, {useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import type {IntlShape} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import type {Channel, ChannelMembership} from '@mattermost/types/channels';
import type {Group, GroupSearchParams} from '@mattermost/types/groups';
import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';
import type {ActionResult} from 'mattermost-redux/types/actions';
import {displayUsername, isGuest} from 'mattermost-redux/utils/user_utils';

import type {Value} from 'components/multiselect/multiselect';
import MultiSelect from 'components/multiselect/multiselect';
import ProfilePicture from 'components/profile_picture';
import BotTag from 'components/widgets/tag/bot_tag';
import GuestTag from 'components/widgets/tag/guest_tag';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import GroupOption from '../channel_invite_modal/group_option';

type Props = {
    profilesNotInCurrentChannel?: UserProfile[];
    profilesInCurrentChannel?: UserProfile[];
    intl: IntlShape;
    channel: Channel ;
    currentUser?: ChannelMembership | undefined;
    onAddCallback?: (userProfiles?: UserProfileValue[]) => void;
    onExited: () => void;
    actions: {
        leaveChannel: (channelId: string) => Promise<ActionResult>;
        getChannelStats?: (channelId: string) => void;
        getChannelMember?: (channelId: string, userId: string) => Promise<ActionResult<ChannelMembership, any>>;
        updateChannelMemberSchemeRoles?: (channelId: string, userId: string, isSchemeUser: boolean, isSchemeAdmin: boolean) => Promise<ActionResult<{ channelId: string; userId: string; isSchemeUser: boolean; isSchemeAdmin: boolean }, any>>;
        loadStatusesForProfilesList?: (users: UserProfile[]) => void;
        addUsersToChannel?: (channelId: string, userIds: string[]) => Promise<ActionResult>;
        searchProfiles?: (term: string, options: any) => Promise<ActionResult>;
        searchAssociatedGroupsForReference?: (prefix: string, teamId: string, channelId: string | undefined, opts: GroupSearchParams) => Promise<ActionResult>;
        getTeamStats?: (teamId: string) => void;
        closeModal?: (modalId: string) => void;
        getProfilesInChannel?: (channelId: string, page: number, perPage: number, sort: string, options: {active?: boolean}) => Promise<ActionResult>;
        getTeamMembersByIds?: (teamId: string, userIds: string[]) => Promise<ActionResult>;
    };
    skipCommit?: boolean;
    isGroupsEnabled?: boolean;
    canManageMembers?: boolean;
    isInvite?: boolean;
}

const USERS_PER_PAGE = 50;

type UserProfileValue = Value & UserProfile;
type GroupValue = Value & Group;

export enum ProfilesInChannelSortBy {
    None = '',
    Admin = 'admin',
}
const UsernameSpan = styled.span`
fontSize: 12px;
`;
const LeaveChannelModal: FC<Props> = ({actions, channel, intl, isInvite, currentUser, canManageMembers, isGroupsEnabled, skipCommit, profilesInCurrentChannel, profilesNotInCurrentChannel, onAddCallback, onExited}) => {
    const selectedItemRef = React.createRef<HTMLDivElement>();
    const [selectedUsers, setSelectedUsers] = useState<UserProfileValue[]>([]);
    const [groupAndUserOptions, setGroupAndUserOptions] = useState < Array<UserProfileValue | GroupValue > >([]);
    const [term, setTerm] = useState('');
    const [show, setShow] = useState(true);
    const [saving, setSavingUsers] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [inviteError, setInviteError] = useState();

    const isUser = (option: UserProfileValue | GroupValue | UserProfile): option is UserProfileValue => {
        return (option as UserProfile).username !== undefined;
    };

    const addValue = (value: UserProfileValue | GroupValue): void => {
        if (isUser(value)) {
            const profile = value;
            setSelectedUsers((prev) => [...prev, profile]);
        }
    };

    useEffect(() => {
        actions.getProfilesInChannel!(channel.id, 0, USERS_PER_PAGE, '', {active: true});
        actions.getTeamStats!(channel.team_id);
        actions.loadStatusesForProfilesList!(profilesInCurrentChannel!);
    }, []);

    useEffect(() => {
        const values = getOptions();
        const userIds = [];

        for (let index = 0; index < values.length; index++) {
            const newValue = values[index];
            if (isUser(newValue)) {
                userIds.push(newValue.id);
            } else if (newValue.member_ids) {
                userIds.push(...newValue.member_ids);
            }
        }
        if (!isEqual(values, groupAndUserOptions)) {
            if (userIds.length > 0) {
                actions.getTeamMembersByIds!(channel.team_id, userIds);
            }
            setGroupAndUserOptions(values);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term]);

    const getOptions = () => {
        const filteredProfiles = profilesInCurrentChannel!.filter((profile) => profile.id.toString() !== currentUser!.user_id.toString());
        return Array.from(new Set(filteredProfiles));
    };

    const onHide = (): void => {
        setShow(false);
        actions.loadStatusesForProfilesList!(profilesNotInCurrentChannel!);
        actions.loadStatusesForProfilesList!(profilesInCurrentChannel!);
    };

    const handleDelete = (values: Array<UserProfileValue | GroupValue>): void => {
        const profiles = values as UserProfileValue[];
        setSelectedUsers(profiles);
    };

    const handlePageChange = (page: number, prevPage: number): void => {
        if (page > prevPage) {
            setLoadingUsers(true);
            actions.getProfilesInChannel!(channel.id, page + 1, USERS_PER_PAGE, '', {active: true});
        }
    };

    const handleLeaveSubmit = () => {
        if (channel) {
            const channelId = channel.id;
            actions.leaveChannel(channelId).then((result: ActionResult) => {
                if (result.data) {
                    handleHide();
                }
            });
        }
    };

    const handleMakeChannelAdmin = (userIds: string[], channelId: string) => {
        updateChannelMemberSchemeRole(true, userIds, channelId);
    };

    const updateChannelMemberSchemeRole = async (schemeAdmin: boolean, userIds: string[], channelId: string) => {
        const {error} = await actions.updateChannelMemberSchemeRoles!(channel.id, userIds, true, schemeAdmin);
        if (error) {
            return;
        }

        actions.getChannelStats!(channel.id);
        actions.getChannelMember!(channel.id, userIds);
        actions.leaveChannel(channelId);
    };

    const handleSubmit = () => {
        const userIds = selectedUsers.map((u) => u.id);
        if (userIds.length === 0) {
            return;
        }

        if (skipCommit && onAddCallback) {
            onAddCallback(selectedUsers);
            setSavingUsers(false);
            setInviteError(undefined);
            onHide();
            return;
        }
        setSavingUsers(true);
        handleMakeChannelAdmin(userIds, channel.id);
        setSavingUsers(false);
        setInviteError(undefined);
        onHide();
    };

    const searshTimeoutIdRef = React.useRef < number | undefined >(0);
    const search = (searchTerm: string): void => {
        const term = searchTerm.trim();
        clearTimeout(searshTimeoutIdRef.current);
        setTerm(term);
        searshTimeoutIdRef.current = window.setTimeout(
            async () => {
                if (!term) {
                    return;
                }

                const options = {
                    team_id: channel.team_id,
                    not_in_channel_id: channel.id,
                    group_constrained: channel.group_constrained,
                };

                const opts = {
                    q: term,
                    filter_allow_reference: true,
                    page: 0,
                    per_page: 100,
                    include_member_count: true,
                    include_member_ids: true,
                };
                const promises = [
                    actions.searchProfiles!(term, options),
                ];
                if (isGroupsEnabled) {
                    promises.push(actions.searchAssociatedGroupsForReference!(term, channel.team_id, channel.id, opts));
                }
                await Promise.all(promises);
                setLoadingUsers(false);
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS,
        );
    };

    const renderAriaLabel = (option: UserProfileValue | GroupValue): string => {
        if (!option) {
            return '';
        }
        if (isUser(option)) {
            return option.username!;
        }

        return option.name!;
    };

    const renderOption = (option: UserProfileValue | GroupValue, isSelected: boolean, onAdd: (option: UserProfileValue | GroupValue) => void, onMouseMove: (option: UserProfileValue | GroupValue) => void) => {
        let rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        if (isUser(option)) {
            const displayName = displayUsername(option, 'full_name');
            return (
                <div
                    key={option.id}
                    ref={isSelected ? selectedItemRef : option.id}
                    className={'more-modal__row clickable ' + rowSelected}
                    onClick={() => onAdd(option)}
                    onMouseMove={() => onMouseMove(option)}
                >
                    <ProfilePicture
                        src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                        size='md'
                        username={option.username}
                    />
                    <div className='more-modal__details'>
                        <div className='more-modal__name'>
                            <span>
                                {displayName}
                                {option.is_bot && <BotTag/>}
                                {isGuest(option.roles) && <GuestTag className='popoverlist'/>}
                                {displayName === option.username ? null : <UsernameSpan className='ml-2 light'>
                                    {'@'}{option.username}
                                </UsernameSpan>
                                }
                            </span>
                        </div>
                    </div>
                    <div className='more-modal__actions'>
                        <div className='more-modal__actions--round'>
                            <i
                                className='icon icon-plus'
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <GroupOption
                group={option}
                key={option.id}
                addUserProfile={onAdd}
                isSelected={isSelected}
                rowSelected={rowSelected}
                onMouseMove={onMouseMove}
                selectedItemRef={selectedItemRef}
            />
        );
    };

    const closeMembersInviteModal = () => {
        actions.closeModal!(ModalIdentifiers.CHANNEL_INVITE);
    };

    const handleHide = () => setShow(false);

    let title;
    let message;
    if (channel && channel.display_name) {
        if (channel.type === Constants.PRIVATE_CHANNEL) {
            title = (
                <FormattedMessage
                    id='leave_private_channel_modal.title'
                    defaultMessage='Leave Private Channel {channel}'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        } else {
            title = (
                <FormattedMessage
                    id='leave_public_channel_modal.title'
                    defaultMessage='Leave Channel {channel}'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        }

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            if (profilesInCurrentChannel!.length > 1 && canManageMembers) {
                message = (
                    <FormattedMessage
                        id='leave_private_channel_modal.which_user'
                        defaultMessage='To which user would you like to grant administrative rights on this channel?'
                        values={{
                            channel: <b>{channel.display_name}</b>,
                        }}
                    />
                );
            } else {
                message = (
                    <FormattedMessage
                        id='leave_private_channel_modal.message'
                        defaultMessage='Do you really want to leave the {channel} channel?'
                        values={{
                            channel: <b>{channel.display_name}</b>,
                        }}
                    />
                );
            }
        } else {
            message = (
                <FormattedMessage
                    id='leave_public_channel_modal.message'
                    defaultMessage='Are you sure you wish to leave the channel {channel}? You can re-join this channel in the future if you change your mind.'
                    values={{
                        channel: <b>{channel.display_name}</b>,
                    }}
                />
            );
        }
    }

    const buttonSubmitText = localizeMessage('multiselect.ad', 'Quitter');
    const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

    let content;

    if (channel.type === Constants.PRIVATE_CHANNEL) {
        if (isInvite && profilesInCurrentChannel!.length > 1) {
            content = (
                <div className='test-channel-1-download'>
                    <div className='alert alert-with-icon-leave alert-grey'>
                        <i className='icon-information-outline'/>
                        <FormattedMessage
                            id='leave_private_channel_modal.last_admin'
                            defaultMessage='As the last administrator of this channel, assign administrative rights to another member before leaving this channel.'
                        />
                    </div>
                    <div className='alert-message'>
                        {message}
                    </div>
                    <MultiSelect
                        key='addUsersToChannelKey'
                        options={groupAndUserOptions}
                        optionRenderer={renderOption}
                        intl={intl}
                        selectedItemRef={selectedItemRef}
                        values={selectedUsers}
                        ariaLabelRenderer={renderAriaLabel}
                        saveButtonPosition={'bottom'}
                        perPage={USERS_PER_PAGE}
                        handlePageChange={handlePageChange}
                        handleInput={search}
                        handleDelete={handleDelete}
                        handleAdd={addValue}
                        handleSubmit={handleSubmit}
                        handleCancel={closeMembersInviteModal}
                        buttonSubmitText={buttonSubmitText}
                        buttonSubmitLoadingText={buttonSubmitLoadingText}
                        saving={saving}
                        loading={loadingUsers}
                        placeholderText={localizeMessage('multiselect.placeholder.peopOrGroups', 'Séléctionner un ou des utilisateurs')}
                        valueWithImage={true}
                        backButtonText={localizeMessage('multiselect.cancel', 'Cancel')}
                        backButtonClick={closeMembersInviteModal}
                        backButtonClass={'btn-tertiary tertiary-button'}
                        customNoOptionsMessage={null}
                    />
                </div>
            );
        } else if (isInvite && profilesInCurrentChannel!.length === 1) {
            content = (
                <div>
                    <div className='alert alert-with-icon-leave alert-grey'>
                        <i className='icon-information-outline'/>
                        <FormattedMessage
                            id='leave_private_channel_modal.one_admin'
                            defaultMessage='You are the last user of this private channel. The channel will be archived and can only be unarchived by an administrator.'
                        />
                    </div>
                    <div className='alert-message'>
                        {message}
                    </div>
                </div>
            );
        } else {
            content = (
                <div>
                    <div className='alert alert-with-icon-leave alert-grey'>
                        <i className='icon-information-outline'/>
                        <FormattedMessage
                            id='leave_private_channel_modal.information'
                            defaultMessage='Only a channel administrator can invite you to join this channel again.'
                        />
                    </div>
                    <div className='alert-message'>
                        {message}
                    </div>
                </div>
            );
        }
    } else {
        content = (<div>{message}</div>);
    }

    const buttonClass = 'btn btn-danger';
    const button = (
        <FormattedMessage
            id='leave_private_channel_modal.leave'
            defaultMessage='Leave'
        />
    );

    return (
        <Modal
            id='addUsersToChannelModal'
            dialogClassName='a11y__modal channel-invite'
            show={show}
            onHide={onHide}
            onExited={onExited}
            role='dialog'
            aria-labelledby='channelInviteModalLabel'
        >
            <Modal.Header
                id='channelInviteModalLabel'
                closeButton={true}
            >
                <Modal.Title
                    componentClass='h1'
                    id='deletePostModalLabel'
                >
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                role='application'
                className='overflow--visible'
            >
                {inviteError}
                <div className='channel-invite__content'>
                    {content}
                </div>
            </Modal.Body>
            {((isInvite && profilesInCurrentChannel!.length === 1) || !isInvite) && <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-tertiary'
                    onClick={onExited}
                    id='cancelModalButton'
                >
                    {localizeMessage('multiselect.cancel', 'Cancel')}
                </button>
                <div className='leave-button'>
                    <button
                        className={buttonClass}
                        autoFocus={true}
                        type='button'
                        data-testid='confirmModalButton'
                        onClick={handleLeaveSubmit}
                        id='confirmModalButton'
                    >
                        {button}
                    </button></div>
            </Modal.Footer>}
        </Modal>
    );
};

export default LeaveChannelModal;
