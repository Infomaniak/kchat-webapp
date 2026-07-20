// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import type {CSSProperties, ReactNode} from 'react';
import React, {useRef, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {isGuest, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import {showContactSheet} from 'components/root/wc_contact_sheet_service';

import {UserStatuses} from 'utils/constants';

import type {GlobalState} from 'types/store';

import './wc_profile_popover.scss';

interface Props {
    triggerComponentId?: string;
    triggerComponentClass?: string;
    triggerComponentStyle?: CSSProperties;
    src?: string;
    username?: string;
    children: ReactNode;
    userId: UserProfile['id'];
    channelId?: Channel['id'];
    overwriteName?: string;
    overwriteIcon?: string;
    fromWebhook?: boolean;
    hideStatus?: boolean;
    returnFocus?: () => void;
}

function getIsTeamAdmin(state: GlobalState, userId: string) {
    const teams = state.entities.teams?.teams;
    const currentTeamId = state.entities.teams?.currentTeamId;
    const membersInTeam = state.entities.teams?.membersInTeam;
    if (!teams || !currentTeamId || !membersInTeam) {
        return false;
    }
    const teamMember = membersInTeam[currentTeamId]?.[userId];
    return Boolean(teamMember && teamMember.scheme_admin);
}

function getIsChannelAdmin(state: GlobalState, userId: string, channelId?: string) {
    const membersInChannel = state.entities.channels?.membersInChannel;
    if (!channelId || !membersInChannel) {
        return false;
    }
    const channelMember = membersInChannel[channelId]?.[userId];
    return channelMember != null && channelMember.scheme_admin;
}

const selectCurrentTeamAccountId = (state: GlobalState) => {
    const teams = state.entities.teams?.teams;
    const currentTeamId = state.entities.teams?.currentTeamId;
    if (!teams || !currentTeamId) {
        return -1;
    }
    return teams[currentTeamId]?.account_id || -1;
};

const selectCurrentTeamName = (state: GlobalState) => {
    const teams = state.entities.teams?.teams;
    const currentTeamId = state.entities.teams?.currentTeamId;
    if (!teams || !currentTeamId) {
        return undefined;
    }
    return teams[currentTeamId]?.name;
};

const makeSelectUserProfile = (userId: string) => (state: GlobalState) =>
    state.entities.users?.profiles?.[userId] as UserProfile | undefined;

const makeSelectUserStatus = (userId: string) => (state: GlobalState) =>
    state.entities.users?.statuses?.[userId] || UserStatuses.OFFLINE;

export function ProfilePopoverController(props: Props) {
    const selectUserProfile = useMemo(() => makeSelectUserProfile(props.userId), [props.userId]);
    const selectUserStatus = useMemo(() => makeSelectUserStatus(props.userId), [props.userId]);
    const currentTeamAccountId = useSelector(selectCurrentTeamAccountId);
    const currentTeamName = useSelector(selectCurrentTeamName);
    const user = useSelector(selectUserProfile);
    const userStatus = useSelector(selectUserStatus);
    const isTeamAdmin = useSelector((state: GlobalState) => getIsTeamAdmin(state, props.userId));
    const isChannelAdmin = useSelector((state: GlobalState) => getIsChannelAdmin(state, props.userId, props.channelId));

    const intl = useIntl();
    const triggerRef = useRef<HTMLSpanElement | null>(null);

    const hasOverriddenProps = Boolean(props.overwriteName) || Boolean(props.overwriteIcon);
    const shouldDisplayMinimalPanel = hasOverriddenProps || Boolean(props.fromWebhook);
    const displayedUsername = props.username || user?.username;
    const isUserGuest = user?.roles ? isGuest(user.roles) : false;

    const badges = useMemo(() => {
        const badgeList: string[] = [];

        if (!shouldDisplayMinimalPanel) {
            if (user?.is_bot) {
                badgeList.push(intl.formatMessage({
                    id: 'tag.default.bot',
                    defaultMessage: 'BOT',
                }));
            }
            if (user?.roles && isSystemAdmin(user?.roles)) {
                badgeList.push(intl.formatMessage({
                    id: 'user_profile.roleTitle.system_admin',
                    defaultMessage: 'System Admin',
                }));
            }
            if (isTeamAdmin) {
                badgeList.push(intl.formatMessage({
                    id: 'user_profile.roleTitle.team_admin',
                    defaultMessage: 'Team Admin',
                }));
            }
            if (isChannelAdmin) {
                badgeList.push(intl.formatMessage({
                    id: 'user_profile.roleTitle.channel_admin',
                    defaultMessage: 'Channel Admin',
                }));
            }
        }

        return badgeList;
    }, [shouldDisplayMinimalPanel, user?.is_bot, user?.roles, isTeamAdmin, isChannelAdmin, intl]);

    const handleClick = () => {
        const trigger = triggerRef.current;
        if (!trigger) {
            return;
        }
        showContactSheet({
            accountId: currentTeamAccountId,
            badges,
            customContent: shouldDisplayMinimalPanel ? (
                <div slot='custom-content'>
                    {intl.formatMessage({
                        id: 'user_profile.account.post_was_created',
                        defaultMessage: 'This post was created by an integration from @{username}',
                    }, {
                        username: displayedUsername,
                    })}
                </div>
            ) : undefined,
            hideStatus: props.hideStatus,
            isUserGuest,
            overwriteIcon: props.overwriteIcon,
            overwriteName: props.overwriteName,
            shouldDisplayMinimalPanel,
            src: props.src,
            teamName: currentTeamName,
            user,
            userStatus,
            username: displayedUsername,
            userId: props.userId,
            returnFocus: props.returnFocus,
        }, trigger);
    };

    return (
        <span
            ref={triggerRef}
            id={props.triggerComponentId}
            className={classNames('profile-popover-trigger', props.triggerComponentClass)}
            style={props.triggerComponentStyle}
            role='button'
            aria-expanded={false}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {props.children}
        </span>
    );
}
