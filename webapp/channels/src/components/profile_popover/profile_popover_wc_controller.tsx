// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import './wc_profile_popover.scss';
import type {
    ReactNode,
} from 'react';
import React, {
    useEffect,
    useRef,
} from 'react';
import {useIntl} from 'react-intl';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users';

import {isGuest, isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import {getHistory} from '../../utils/browser_history';
import {copyToClipboard} from "../../utils/utils";

export interface ProfilePopoverAdditionalProps {
    disabled?: boolean;
    currentTeamAccountId?: number;
    currentTeamName?: string;
    size?: 'md' | 'lg' | 'xl';
    isExternal?: boolean;
    actions?: any;
    currentUser?: UserProfile;
    user?: UserProfile;
    userStatus?: string;
    isTeamAdmin?: boolean;
    isChannelAdmin?: boolean;
}

export interface ProfilePopoverProps extends ProfilePopoverAdditionalProps{

    /**
     * The Props for the trigger component
     */
    triggerComponentAs?: React.ElementType;
    triggerComponentId?: HTMLElement['id'];
    triggerComponentClass?: HTMLElement['className'];
    triggerComponentStyle?: HTMLElement['style'];

    /**
     * Source URL from the image to display in the popover
     */
    src?: string;

    /**
     * Username of the profile.
     */
    username?: string;

    /**
     * This should be the trigger button for the popover, Do note that the root element of the trigger component should be passed in triggerComponentRoot
     */
    children: ReactNode | ReactNode[];
    userId: UserProfile['id'];
    channelId?: Channel['id'];

    /**
     * The overwritten username that should be shown at the top of the popover
     */
    overwriteName?: string;

    /**
     * Source URL from the image that should override default image
     */
    overwriteIcon?: string;

    /**
     * Set to true of the popover was opened from a webhook post
     */
    fromWebhook?: boolean;
    hideStatus?: boolean;

    /**
     * Function to call to return focus to the previously focused element when the popover closes.
     * If not provided, the popover will automatically determine the previously focused element
     * and focus that on close. However, if the previously focused element is not correctly detected
     * by the popover, or the previously focused element will disappear after the popover opens,
     * it is necessary to provide this function to focus the correct element.
     */
    returnFocus?: () => void;

    onToggle?: (isMounted: boolean) => void;
}

export type WcContactSheetElement = HTMLElement & {open: () => void; close: () => void};

export const ProfilePopoverWcController = (props: ProfilePopoverProps) => {
    const {
        disabled,
        username,
        hideStatus,
        userStatus,
        children,
        currentTeamAccountId,
        currentTeamName,
        isExternal = false,
        size = 'md',
        triggerComponentClass = '',
        returnFocus = () => null,
        overwriteName,
        overwriteIcon,
        triggerComponentStyle,
        src,
        user,
        isTeamAdmin,
        isChannelAdmin,
    } = props;

    const badges = [];
    const localRef = useRef<WcContactSheetElement | undefined>(undefined);
    const {formatMessage} = useIntl();

    if (user?.is_bot) {
        badges.push(formatMessage({
            id: 'tag.default.bot',
            defaultMessage: 'BOT',
        }));
    }
    if (isSystemAdmin(user?.roles)) {
        badges.push(formatMessage({
            id: 'user_profile.roleTitle.system_admin',
            defaultMessage: 'System Admin',
        }));
    }
    if (isTeamAdmin) {
        badges.push(formatMessage({
            id: 'user_profile.roleTitle.team_admin',
            defaultMessage: 'Team Admin',
        }));
    }
    if (isChannelAdmin) {
        badges.push(formatMessage({
            id: 'user_profile.roleTitle.channel_admin',
            defaultMessage: 'Channel Admin',
        }));
    }

    useEffect(() => {
        const current = localRef?.current;
        if (!current) {
            return () => {};
        }

        const handleQuickActionClick = (e: CustomEvent) => {
            const {option, user: u} = e.detail;

            if (option.id === 'send-direct-message') {
                getHistory().push(`/${currentTeamName}/messages/@${u.kChatUserName}`);
                e.preventDefault();
            }
            if (option.id === 'start-call') {
                getHistory().push(`/${currentTeamName}/messages/@${user?.username}?call=true`);
                e.preventDefault();
            }

            if (option.id === 'copy-kchat-user-id') {
                copyToClipboard(user.id)
                e.preventDefault();
            }
        };

        current.addEventListener('close', returnFocus);
        current.addEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);
        current.badges = badges;
        return () => {
            current?.removeEventListener('close', returnFocus);
            current?.removeEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);
        };
    }, []);

    return (
        <>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <wc-contact-sheet
                disabled={disabled}
                prevent-stop-propagation={true}
                ref={localRef}
                class={triggerComponentClass}
                prevent-open-on-hover={true}
                account-id={currentTeamAccountId}
                background-color={'transparent'}
                is-external={user?.roles ? isGuest(user.roles) : isExternal}
                k-chat-team-name={currentTeamName}
                k-chat-user-name={username || user?.username}
                presence={hideStatus ? undefined : userStatus}
                size={size}
                src={overwriteIcon || src}
                timezone={user?.timezone?.useAutomaticTimezone ? user?.timezone.automaticTimezone : user?.timezone?.manualTimezone}
                user-id={user?.user_id}
                user-mail={user?.email}
                user-name={overwriteName || user?.first_name + ' ' + user?.last_name}
                style={triggerComponentStyle}
            >
                <span slot='trigger'>{children}</span>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
            </wc-contact-sheet>

        </>
    );
};
