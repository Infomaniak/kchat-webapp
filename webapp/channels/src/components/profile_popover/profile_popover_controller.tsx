// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import type {CSSProperties, ReactNode} from 'react';
import React, {useEffect, useMemo, useRef} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {isGuest, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import {getHistory} from 'utils/browser_history';
import {UserStatuses} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

import type {GlobalState} from 'types/store';

import './wc_profile_popover.scss';

interface WcContactSheetElement extends HTMLElement {
    open(): void;
    close(): void;
    hiddenOptions: string[];
    hiddenInformations: string[];
    customTrigger: HTMLElement | null;
}

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
    onToggle?: (isMounted: boolean) => void;
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

const selectAnyModalOpen = (state: GlobalState) =>
    Boolean(
        state.views?.modals?.modalState &&
        Object.keys(state.views.modals.modalState).some((k) => state.views.modals.modalState[k].open),
    );

function WcContactSheet({
    accountId,
    badges,
    customContent,
    hideStatus,
    isUserGuest,
    overwriteIcon,
    overwriteName,
    sheetRef,
    shouldDisplayMinimalPanel,
    src,
    teamName,
    user,
    userStatus,
    username,
}: {
    accountId: number;
    badges: string[];
    customContent?: ReactNode;
    hideStatus?: boolean;
    isUserGuest: boolean;
    overwriteIcon?: string;
    overwriteName?: string;
    sheetRef: React.RefObject<WcContactSheetElement>;
    shouldDisplayMinimalPanel: boolean;
    src?: string;
    teamName?: string;
    user?: UserProfile;
    userStatus: string;
    username?: string;
}) {
    return (
        <div style={{position: 'absolute', left: '-9999px', pointerEvents: 'none'}}>
            <wc-contact-sheet
                account-id={accountId}
                background-color={'transparent'}
                is-external={isUserGuest}
                k-chat-team-name={teamName}
                k-chat-user-name={username}
                presence={hideStatus ? undefined : userStatus}
                prevent-open-on-hover={true}
                prevent-stop-propagation={true}
                ref={sheetRef}
                size={'md'}
                src={overwriteIcon || src}
                timezone={user?.timezone?.useAutomaticTimezone ? user?.timezone.automaticTimezone : user?.timezone?.manualTimezone}
                user-id={shouldDisplayMinimalPanel ? undefined : user?.user_id}
                user-mail={user?.is_bot ? `@${username}` : user?.email}
                user-name={overwriteName || user?.first_name + ' ' + user?.last_name}
            >
                {badges.map((badge, idx) => (
                    <wc-pill
                        key={idx}
                        slot='custom-badges'
                        style={{
                            color: 'var(--wc-contact-sheet-pill-color)',
                            // eslint-disable-next-line no-useless-computed-key
                            ['--wc-pill-background']: 'var(--wc-contact-sheet-pill-background-color)',
                        }}
                        size='small'
                        round={true}
                        prevent-removal={true}
                    >
                        {badge}
                    </wc-pill>
                ))}
                {customContent}
            </wc-contact-sheet>
        </div>
    );
}

export function ProfilePopoverController(props: Props) {
    const currentTeamAccountId = useSelector(selectCurrentTeamAccountId);
    const currentTeamName = useSelector(selectCurrentTeamName);
    const user = useSelector(makeSelectUserProfile(props.userId));
    const userStatus = useSelector(makeSelectUserStatus(props.userId));
    const isTeamAdmin = useSelector((state: GlobalState) => getIsTeamAdmin(state, props.userId));
    const isChannelAdmin = useSelector((state: GlobalState) => getIsChannelAdmin(state, props.userId, props.channelId));
    const anyModalOpen = useSelector(selectAnyModalOpen);

    const intl = useIntl();
    const triggerRef = useRef<HTMLSpanElement | null>(null);
    const contactSheetRef = useRef<WcContactSheetElement | null>(null);
    const latestRef = useRef({currentTeamName, user, userId: props.userId, returnFocus: props.returnFocus});
    latestRef.current = {currentTeamName, user, userId: props.userId, returnFocus: props.returnFocus};

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

    useEffect(() => {
        const el = contactSheetRef.current;
        const trigger = triggerRef.current;
        if (el && trigger) {
            el.customTrigger = trigger;
        }

        return () => {
            if (el) {
                el.customTrigger = null;
            }
        };
    }, []);

    useEffect(() => {
        const wc = contactSheetRef.current;
        if (!wc) {
            return undefined;
        }

        const handleQuickActionClick = (e: CustomEvent) => {
            const {option, user: u} = e.detail;
            const values = latestRef.current;

            if (option.id === 'send-direct-message') {
                getHistory().push(`/${values.currentTeamName}/messages/@${u.kChatUserName}`);
                e.preventDefault();
            }
            if (option.id === 'start-call') {
                getHistory().push(`/${values.currentTeamName}/messages/@${values.user?.username}?call=true`);
                e.preventDefault();
            }
            if (option.id === 'copy-kchat-user-id') {
                copyToClipboard(values.userId);
                e.preventDefault();
            }
        };

        const handleClose = () => latestRef.current.returnFocus?.();

        wc.addEventListener('close', handleClose);
        wc.addEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);

        return () => {
            wc.removeEventListener('close', handleClose);
            wc.removeEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);
        };
    }, []);

    useEffect(() => {
        const wc = contactSheetRef.current;
        if (!wc) {
            return;
        }
        if (user?.is_bot) {
            wc.hiddenInformations = ['userTimezone', 'email'];
            wc.hiddenOptions = ['send-mail', 'search-incoming-mail', 'block-user', 'schedule-event', 'create-contact', 'show-contact', 'start-call', 'manage-profile'];
        } else {
            wc.hiddenInformations = [];
            wc.hiddenOptions = [];
        }
    }, [user?.is_bot]);

    useEffect(() => {
        contactSheetRef.current?.close?.();
    }, [anyModalOpen]);

    return (
        <>
            <span
                ref={triggerRef}
                id={props.triggerComponentId}
                className={props.triggerComponentClass}
                style={{
                    display: 'inline-block',
                    ...props.triggerComponentStyle,
                }}
                role='button'
                tabIndex={0}
            >
                {props.children}
            </span>

            <WcContactSheet
                accountId={currentTeamAccountId}
                badges={badges}
                customContent={shouldDisplayMinimalPanel ? (
                    <div slot='custom-content'>
                        {intl.formatMessage({
                            id: 'user_profile.account.post_was_created',
                            defaultMessage: 'This post was created by an integration from @{username}',
                        }, {
                            username: displayedUsername,
                        })}
                    </div>
                ) : undefined}
                hideStatus={props.hideStatus}
                isUserGuest={isUserGuest}
                overwriteIcon={props.overwriteIcon}
                overwriteName={props.overwriteName}
                sheetRef={contactSheetRef}
                shouldDisplayMinimalPanel={shouldDisplayMinimalPanel}
                src={props.src}
                teamName={currentTeamName}
                user={user}
                userStatus={userStatus}
                username={displayedUsername}
            />
        </>
    );
}
