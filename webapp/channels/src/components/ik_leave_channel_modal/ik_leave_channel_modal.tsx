// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Skeleton} from '@mui/material';
import debounce from 'lodash/debounce';
import type {FC} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import type {Channel, ChannelMembership} from '@mattermost/types/channels';
import type {Group, GroupSearchParams} from '@mattermost/types/groups';
import type {TeamStats} from '@mattermost/types/teams';
import type {UserProfile} from '@mattermost/types/users';

import {ProfilesInChannelSortBy} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';
import {getTheme} from 'mattermost-redux/selectors/entities/preferences';
import type {ActionResult} from 'mattermost-redux/types/actions';
import {displayUsername, isGuest, filterProfilesStartingWithTerm} from 'mattermost-redux/utils/user_utils';

import CompassDesignProvider from 'components/compass_design_provider';
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
    channel: Channel ;
    currentUser?: ChannelMembership | undefined;
    onAddCallback?: (userProfiles?: UserProfileValue[]) => void;
    onExited: () => void;
    actions: {
        deleteChannel: (channelId: string) => void;
        leaveChannel: (channelId: string) => Promise<ActionResult>;
        getChannelStats: (channelId: string) => void;
        getChannelMemberAction: (channelId: string, userId: string) => Promise<ActionResult<ChannelMembership, any>>;
        updateChannelMemberSchemeRoles: (channelId: string, userId: string, isSchemeUser: boolean, isSchemeAdmin: boolean) => Promise<ActionResult<{ channelId: string; userId: string; isSchemeUser: boolean; isSchemeAdmin: boolean }, any>>;
        loadStatusesForProfilesList: (users: UserProfile[]) => void;
        addUsersToChannel: (channelId: string, userIds: string[]) => Promise<ActionResult>;
        searchProfiles: (term: string, options: any) => Promise<ActionResult>;
        searchAssociatedGroupsForReference: (prefix: string, teamId: string, channelId: string | undefined, opts: GroupSearchParams) => Promise<ActionResult>;
        getTeamStats: (teamId: string) => Promise<ActionResult<TeamStats, any>>;
        closeModal: (modalId: string) => void;
        getProfilesInChannel: (channelId: string, page: number, perPage: number, sort: string, options: {active?: boolean}) => Promise<ActionResult>;
        getTeamMembersByIds: (teamId: string, userIds: string[]) => Promise<ActionResult>;
        loadProfilesAndReloadChannelMembers: (page: number, perParge: number, channelId: string, sort: string) => void;
    };
    skipCommit?: boolean;
    isGroupsEnabled?: boolean;
    hasChannelMembersAdmin?: boolean;
    currentMemberIsChannelAdmin?: boolean;
}

const USERS_PER_PAGE = 50;

type UserProfileValue = UserProfile & Value;
type GroupValue = Group & Value ;

const UsernameSpan = styled.span`
fontSize: 12px;
`;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const useTransientRef = <T extends unknown>(value: T) => {
    const ref = React.useRef(value);
    ref.current = value;
    return ref;
};

const isUser = (option: UserProfileValue | GroupValue | UserProfile): option is UserProfileValue => {
    return (option as UserProfile).username !== undefined;
};

const IkLeaveChannelModal: FC<Props> = ({actions, channel, currentMemberIsChannelAdmin, hasChannelMembersAdmin, currentUser, isGroupsEnabled, skipCommit, profilesInCurrentChannel, profilesNotInCurrentChannel, onAddCallback, onExited}) => {
    const [inviteError, setInviteError] = useState();
    const [initialLoadingUsers, setInitalLoadingUsers] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSavingUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<UserProfileValue[]>([]);
    const [show, setShow] = useState(true);
    const [term, setTerm] = useState('');
    const selectedItemRef = React.createRef<HTMLDivElement>();
    const theme = useSelector(getTheme);
    const intl = useIntl();

    const addValue = (value: UserProfileValue | GroupValue): void => {
        if (isUser(value)) {
            const profile = value;
            setSelectedUsers((prev) => [...prev, profile]);
        }
    };

    const groupAndUserOptions = useMemo(() => {
        let filteredProfiles: UserProfile[] = [];
        if (currentUser !== undefined && profilesInCurrentChannel) {
            filteredProfiles = profilesInCurrentChannel.filter(
                (profile) => profile.id.toString() !== currentUser!.user_id.toString(),
            );
        }
        return filterProfilesStartingWithTerm(filteredProfiles, term) as Array<UserProfileValue | GroupValue>;
    }, [currentUser, profilesInCurrentChannel, term]);

    const onHide = (): void => {
        setShow(false);
        actions.loadStatusesForProfilesList(profilesNotInCurrentChannel!);
        actions.loadStatusesForProfilesList(profilesInCurrentChannel!);
    };

    const handleDelete = (values: Array<UserProfileValue | GroupValue>): void => {
        const profiles = values as UserProfileValue[];
        setSelectedUsers(profiles);
    };

    const handlePageChange = useCallback(async (page: number, prevPage: number): Promise<void> => {
        if (page > prevPage) {
            setLoadingUsers(true);
            try {
                await actions.getProfilesInChannel(channel.id, page + 1, USERS_PER_PAGE, '', {active: true});
            } catch (err) {} // eslint-disable-line no-empty
            setLoadingUsers(false);
        }
    }, [channel.id, actions]);

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

    const handleArchiveSubmit = () => {
        if (channel) {
            const channelId = channel.id;
            actions.deleteChannel(channelId);
            handleHide();
        }
    };

    const handleMakeChannelAdmin = (userIds: string, channelId: string) => {
        updateChannelMemberSchemeRole(true, userIds, channelId);
    };

    const updateChannelMemberSchemeRole = async (schemeAdmin: boolean, userIds: string, channelId: string) => {
        const {error} = await actions.updateChannelMemberSchemeRoles(channel.id, userIds, true, schemeAdmin);
        if (error) {
            return;
        }

        actions.getChannelStats(channel.id);
        actions.getChannelMemberAction(channel.id, userIds);
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
        userIds.forEach((userId) => {
            handleMakeChannelAdmin(userId, channel.id);
        });
        setSavingUsers(false);
        setInviteError(undefined);
        onHide();
    };

    const searchFnRef = useTransientRef(async (term: string) => {
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
            actions.searchProfiles(term, options),
        ];
        if (isGroupsEnabled) {
            promises.push(actions.searchAssociatedGroupsForReference(term, channel.team_id, channel.id, opts));
        }
        await Promise.all(promises);
        setLoadingUsers(false);
    });

    const search = useMemo(() => {
        const debounced = debounce(
            (term: string) => {
                searchFnRef.current(term);
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS,
        );

        return Object.assign(
            (searchTerm: string): void => {
                setTerm(searchTerm.trim());
                debounced(searchTerm.trim());
            },
            {cancel: debounced.cancel},
        );
    }, [setTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderAriaLabel = (option: UserProfileValue | GroupValue): string => {
        if (!option) {
            return '';
        }
        if (isUser(option)) {
            return option.username!;
        }

        return option.name!;
    };

    /**
     * Stop debounce when component unmounts to prevent setting state on unmounted component
     */
    useEffect(() => search.cancel);

    /**
     * Fetch profiles and team stats when the component mounts and only if the current user is a channel admin
     */
    useEffect(() => {
        if (currentMemberIsChannelAdmin) {
            const fetchProfiles = async () => {
                await Promise.all([
                    actions.loadProfilesAndReloadChannelMembers(0, USERS_PER_PAGE, channel.id, ProfilesInChannelSortBy.Admin),
                    actions.getTeamStats(channel.team_id),
                ]);

                setInitalLoadingUsers(false);
            };
            fetchProfiles();
        } else {
            setInitalLoadingUsers(false);
        }
    }, [currentMemberIsChannelAdmin]);

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

    const closeLeaveModal = () => {
        actions.closeModal(ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL);
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
            if (profilesInCurrentChannel!.length > 1 && hasChannelMembersAdmin) {
                message = (
                    <FormattedMessage
                        id='leave_private_channel_modal.which_user'
                        defaultMessage='To which user would you like to grant administrative rights on this channel?'
                        values={{
                            channel: <b>{channel.display_name}</b>,
                        }}
                    />
                );
            } else if (hasChannelMembersAdmin && profilesInCurrentChannel!.length === 1) {
                message = (
                    <FormattedMessage
                        id='leave_private_channel_modal.last_user'
                        defaultMessage='Do you want to archive the channel {channel}?'
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

    const buttonSubmitText = localizeMessage({id: 'multiselect.quit', defaultMessage: 'Quitter'});
    const buttonSubmitLoadingText = localizeMessage({id: 'multiselect.adding', defaultMessage: 'Adding...'});

    let content;
    if (channel.type === Constants.PRIVATE_CHANNEL) {
        if (initialLoadingUsers) {
            content = (
                <CompassDesignProvider theme={theme}>
                    <div
                        className='skeleton-mui leave-channel-modal'
                    >
                        <Skeleton
                            variant='rectangular'
                            width={538}
                            height={74}
                            style={{marginBottom: '16px'}}
                        />
                        <Skeleton
                            variant='rectangular'
                            width={534}
                            height={48}
                            style={{marginBottom: '16px'}}
                        />
                    </div>
                    <div style={{height: '106px'}}/>
                </CompassDesignProvider>
            );
        } else if (hasChannelMembersAdmin && profilesInCurrentChannel!.length > 1) {
            content = (
                <div data-testid='test-channel-1-download'>
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
                        handleCancel={closeLeaveModal}
                        buttonSubmitText={buttonSubmitText}
                        buttonSubmitLoadingText={buttonSubmitLoadingText}
                        saving={saving}
                        showInputByDefault={true}
                        loading={loadingUsers}
                        placeholderText={localizeMessage({id: 'multiselect.placeholder.peopOrGroups', defaultMessage: 'Séléctionner un ou des utilisateurs'})}
                        valueWithImage={true}
                        backButtonText={localizeMessage({id: 'multiselect.cancel', defaultMessage: 'Cancel'})}
                        backButtonClick={closeLeaveModal}
                        backButtonClass={'btn-tertiary tertiary-button'}
                        customNoOptionsMessage={null}
                    />
                </div>
            );
        } else if (hasChannelMembersAdmin && profilesInCurrentChannel!.length === 1) {
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
                <div className='channel-invite__content no-options'>
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

    const buttonArchiveClass = 'btn btn-danger';
    const archiveButton = (
        <FormattedMessage
            id='delete_channel.del'
            defaultMessage='Archive'
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
            {((hasChannelMembersAdmin && profilesInCurrentChannel!.length === 1) || !hasChannelMembersAdmin) && !initialLoadingUsers && <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-tertiary'
                    onClick={onExited}
                    id='cancelModalButton'
                >
                    {localizeMessage({id: 'multiselect.cancel', defaultMessage: 'Cancel'})}
                </button>
                {hasChannelMembersAdmin ? (<div className='btn-leave'>
                    <button
                        className={buttonArchiveClass}
                        autoFocus={true}
                        type='button'
                        data-testid='confirmModalButton'
                        onClick={handleArchiveSubmit}
                        id='confirmModalButton'
                    >
                        {archiveButton}
                    </button>
                </div>) : (
                    <button
                        className={buttonClass}
                        autoFocus={true}
                        type='button'
                        data-testid='confirmModalButton'
                        onClick={handleLeaveSubmit}
                        id='confirmModalButton'
                    >
                        {button}
                    </button>)}
            </Modal.Footer>}
        </Modal>
    );
};

export default IkLeaveChannelModal;
