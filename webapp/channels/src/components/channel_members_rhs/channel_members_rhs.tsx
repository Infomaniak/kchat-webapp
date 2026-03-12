// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useHistory} from 'react-router-dom';
import styled from 'styled-components';

import type {Channel, ChannelMembership, PendingGuest, PendingGuests} from '@mattermost/types/channels';
import type {Group} from '@mattermost/types/groups';
import type {UserProfile} from '@mattermost/types/users';

import {ProfilesInChannelSortBy} from 'mattermost-redux/actions/users';

import AlertBanner from 'components/alert_banner';
import ChannelInviteModal from 'components/channel_invite_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import InfoIconFilled from 'components/widgets/icons/info_icon_filled';
import WithTooltip from 'components/with_tooltip';

import Constants, {ModalIdentifiers} from 'utils/constants';

import type {ModalData} from 'types/actions';

import ActionBar from './action_bar';
import Header from './header';
import MemberList from './member_list';
import SearchBar from './search';

const USERS_PER_PAGE = 100;
export interface ChannelMember {
    user: UserProfile;
    membership?: ChannelMembership;
    status?: string;
    displayName: string;
}

const MembersContainer = styled.div`
    flex: 1 1 auto;
    padding: 0 4px 16px;
`;

export interface Props {
    channel: Channel;
    currentUserIsChannelAdmin: boolean;
    membersCount: number;
    searchTerms: string;
    canGoBack: boolean;
    teamUrl: string;
    channelMembers: ChannelMember[];
    channelGroups: Group[];
    canManageMembers: boolean;
    editing: boolean;
    pendingGuests: PendingGuests;

    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        openDirectChannelToUserId: (userId: string) => Promise<{data: Channel}>;
        closeRightHandSide: () => void;
        goBack: () => void;
        setChannelMembersRhsSearchTerm: (terms: string) => void;
        loadProfilesAndReloadChannelMembers: (page: number, perParge: number, channelId: string, sort: string) => void;
        loadMyChannelMemberAndRole: (channelId: string) => void;
        setEditChannelMembers: (active: boolean) => void;
        searchProfilesAndChannelMembers: (term: string, options: any) => Promise<{data: UserProfile[]}>;
        getChannelPendingGuests: (channelId: string) => void;
        fetchChannelGroups: (channelId: string) => Promise<{data: Group[]}>;
    };
    isGuestUser: boolean;
}

export enum ListItemType {
    Member = 'member',
    PendingGuest = 'pending-guest',
    Group = 'group',
    FirstSeparator = 'first-separator',
    Separator = 'separator',
}

export interface ListItem {
    type: ListItemType;
    data: ChannelMember | PendingGuest | Group | JSX.Element;
}

export default function ChannelMembersRHS({
    channel,
    currentUserIsChannelAdmin,
    searchTerms,
    membersCount,
    canGoBack,
    teamUrl,
    channelMembers,
    channelGroups,
    canManageMembers,
    editing = false,
    pendingGuests,
    actions,
    isGuestUser,
}: Props) {
    const history = useHistory();

    const [page, setPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const {formatMessage} = useIntl();

    const searching = searchTerms !== '';

    const isDefaultChannel = channel.name === Constants.DEFAULT_CHANNEL;

    // show search if there's more than 20 or if the user have an active search.
    const showSearch = searching || membersCount >= 20;

    const pendingGuestsCount = Object.keys(pendingGuests).length;

    useEffect(() => {
        actions.getChannelPendingGuests(channel.id);
    }, [channel, actions]);

    useEffect(() => {
        return () => {
            actions.setChannelMembersRhsSearchTerm('');
        };
    }, []);

    const list = useMemo(() => {
        const listcp: ListItem[] = [];

        const lowerSearch = searchTerms.toLowerCase();
        const filteredGroups = searchTerms ? channelGroups.filter((g) => g.display_name.toLowerCase().includes(lowerSearch) || g.name.toLowerCase().includes(lowerSearch)) : channelGroups;

        const admins = channelMembers.filter((m) => m.membership?.scheme_admin === true);
        const members = channelMembers.filter((m) => m.membership?.scheme_admin !== true);

        const groupsSeparator = (isFirst: boolean) => {
            const SeparatorComponent = isFirst ? FirstMemberListSeparator : MemberListSeparator;
            return (
                <SeparatorComponent>
                    <SeparatorWithInfo>
                        <FormattedMessage
                            id='channel_members_rhs.groups.title'
                            defaultMessage='TEAMS'
                        />
                        <WithTooltip
                            title={formatMessage({
                                id: 'channel_members_rhs.groups.info_tooltip',
                                defaultMessage: 'Team members are added individually in the Members section of this channel.',
                            })}
                        >
                            <InfoIconButton aria-label={formatMessage({id: 'channel_members_rhs.groups.info_tooltip', defaultMessage: 'Team members are added individually in the Members section of this channel.'})}>
                                <InfoIconFilled/>
                            </InfoIconButton>
                        </WithTooltip>
                    </SeparatorWithInfo>
                </SeparatorComponent>
            );
        };

        if (admins.length > 0) {
            listcp.push({
                type: ListItemType.FirstSeparator,
                data: (
                    <FirstMemberListSeparator>
                        <FormattedMessage
                            id='channel_members_rhs.list.channel_admin_title'
                            defaultMessage='CHANNEL ADMINS'
                        />
                    </FirstMemberListSeparator>
                ),
            });
            admins.forEach((member) => {
                listcp.push({type: ListItemType.Member, data: member});
            });
        }

        if (filteredGroups.length > 0) {
            const isFirst = listcp.length === 0;
            listcp.push({
                type: isFirst ? ListItemType.FirstSeparator : ListItemType.Separator,
                data: groupsSeparator(isFirst),
            });
            filteredGroups.forEach((group) => {
                listcp.push({type: ListItemType.Group, data: group});
            });
        }

        if (members.length > 0) {
            const isFirst = listcp.length === 0;
            const SeparatorComponent = isFirst ? FirstMemberListSeparator : MemberListSeparator;
            listcp.push({
                type: isFirst ? ListItemType.FirstSeparator : ListItemType.Separator,
                data: (
                    <SeparatorComponent>
                        <FormattedMessage
                            id='channel_members_rhs.list.channel_members_title'
                            defaultMessage='MEMBERS'
                        />
                    </SeparatorComponent>
                ),
            });
            members.forEach((member) => {
                listcp.push({type: ListItemType.Member, data: member});
            });
        }

        if (!isGuestUser) {
            Object.keys(pendingGuests).forEach((key, index) => {
                const pendingGuest = pendingGuests[key];
                if (index === 0) {
                    const text = (
                        <FormattedMessage
                            id='channel_members_rhs.list.channel_pending_guests_title'
                            defaultMessage='PENDING INVITATIONS'
                        />
                    );
                    listcp.push({
                        type: ListItemType.Separator,
                        data: <MemberListSeparator>{text}</MemberListSeparator>,
                    });
                }
                listcp.push({type: ListItemType.PendingGuest, data: pendingGuest});
            });
        }

        return listcp;
    }, [channelMembers, channelGroups, searchTerms, pendingGuests, formatMessage, isGuestUser]);

    useEffect(() => {
        if (channel.type === Constants.DM_CHANNEL) {
            let rhsAction = actions.closeRightHandSide;
            if (canGoBack) {
                rhsAction = actions.goBack;
            }
            rhsAction();
            return;
        }

        setPage(0);
        setIsNextPageLoading(false);
        actions.setChannelMembersRhsSearchTerm('');
        actions.loadProfilesAndReloadChannelMembers(0, USERS_PER_PAGE, channel.id, ProfilesInChannelSortBy.Admin);
        actions.loadMyChannelMemberAndRole(channel.id);
        actions.fetchChannelGroups(channel.id);
    }, [channel.id, channel.type]);

    const setSearchTerms = async (terms: string) => {
        actions.setChannelMembersRhsSearchTerm(terms);
    };

    const doSearch = useCallback(debounce(async (terms: string) => {
        await actions.searchProfilesAndChannelMembers(terms, {in_team_id: channel.team_id, in_channel_id: channel.id});
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS), [actions.searchProfilesAndChannelMembers]);

    useEffect(() => {
        if (searchTerms) {
            doSearch(searchTerms);
        }
    }, [searchTerms]);

    const inviteMembers = () => {
        if (channel.type === Constants.GM_CHANNEL) {
            return actions.openModal({
                modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
                dialogType: MoreDirectChannels,
                dialogProps: {isExistingChannel: true, focusOriginElement: 'channelInfoRHSAddPeopleButton'},
            });
        }

        return actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
    };

    const openDirectMessage = useCallback(async (user: UserProfile) => {
        // we first prepare the DM channel...
        await actions.openDirectChannelToUserId(user.id);

        // ... and then redirect to it
        history.push(teamUrl + '/messages/@' + user.username);

        await actions.closeRightHandSide();
    }, [actions.openDirectChannelToUserId, history, teamUrl, actions.closeRightHandSide]);

    const loadMore = useCallback(async () => {
        setIsNextPageLoading(true);

        await actions.loadProfilesAndReloadChannelMembers(page + 1, USERS_PER_PAGE, channel.id, ProfilesInChannelSortBy.Admin);
        setPage(page + 1);

        setIsNextPageLoading(false);
    }, [actions.loadProfilesAndReloadChannelMembers, page, channel.id],
    );

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >

            <Header
                channel={channel}
                canGoBack={canGoBack}
                onClose={actions.closeRightHandSide}
                goBack={actions.goBack}
            />

            <ActionBar
                channelType={channel.type}
                membersCount={membersCount}
                pendingGuestsCount={pendingGuestsCount}
                canManageMembers={canManageMembers}
                editing={editing}
                actions={{
                    startEditing: () => actions.setEditChannelMembers(true),
                    stopEditing: () => actions.setEditChannelMembers(false),
                    inviteMembers,
                }}
            />

            {/* Users with user management permissions have special restrictions in the default channel */}
            {(editing && isDefaultChannel && !currentUserIsChannelAdmin) && (
                <AlertContainer>
                    <AlertBanner
                        mode='info'
                        variant='app'
                        message={formatMessage({
                            id: 'channel_members_rhs.default_channel_moderation_restrictions',
                            defaultMessage: 'In this channel, you can only remove guests. Only <link>channel admins</link> can manage other members.',
                        }, {
                            link: (msg: React.ReactNode) => (
                                <span>{msg}</span>
                            ),
                        })}
                    />
                </AlertContainer>
            )}

            {showSearch && (
                <SearchBar
                    terms={searchTerms}
                    onInput={setSearchTerms}
                />
            )}

            <MembersContainer>
                {list.length > 0 && (
                    <MemberList
                        searchTerms={searchTerms}
                        members={list}
                        editing={editing}
                        canRemoveGroups={currentUserIsChannelAdmin}
                        channel={channel}
                        openDirectMessage={openDirectMessage}
                        loadMore={loadMore}
                        hasNextPage={channelMembers.length < membersCount}
                        isNextPageLoading={isNextPageLoading}
                    />
                )}
            </MembersContainer>
        </div>
    );
}

const MemberListSeparator = styled.div`
    font-weight: 600;
    font-size: 12px;
    line-height: 28px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    padding: 0px 12px;
    color: rgba(var(--center-channel-color-rgb), 0.75);
    margin-top: 16px;
`;

const FirstMemberListSeparator = styled(MemberListSeparator)`
    margin-top: 0px;
`;

const AlertContainer = styled.div`
    padding: 0 20px 15px;
`;

const SeparatorWithInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const InfoIconButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    line-height: 1;

    svg path {
        fill: rgba(var(--center-channel-color-rgb), 0.48);
    }

    &:hover svg path {
        fill: rgba(var(--center-channel-color-rgb), 0.64);
    }
`;
