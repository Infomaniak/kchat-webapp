// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import './profile_popover.scss';
import type {ForwardedRef,
    ReactElement,
    ReactNode} from 'react';
import React, {
    Children,
    cloneElement,
    useEffect, useImperativeHandle,
    useRef,
} from 'react';
import {useDispatch} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {createDirectChannel} from 'mattermost-redux/actions/channels';
import {Client4} from 'mattermost-redux/client';

import type {ModalData} from '../../types/actions';
import {getHistory} from '../../utils/browser_history';

export interface ProfilePopoverProps {
    disabled?: boolean;
    username?: string;
    hideStatus?: boolean;
    currentUser?: UserProfile;
    userStatus?: string;
    user?: UserProfile;
    children?: ReactNode;
    accountId?: number;
    backgroundColor?: string;
    isExternal?: boolean;
    presence?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    triggerComponentClass?: string;
    triggerComponentStyle?: Partial<CSSStyleDeclaration>;
    currentTeamAccountId?: number;
    currentTeamName?: string;

    /**
     * Function to call to return focus to the previously focused element when the popover closes.
     * If not provided, the popover will automatically determine the previously focused element
     * and focus that on close. However, if the previously focused element is not correctly detected
     * by the popover, or the previously focused element will disappear after the popover opens,
     * it is necessary to provide this function to focus the correct element.
     *
     * To match wc-contact-sheet behavior this function is passed to the onClose callBack of the panel
     */
    returnFocus?: () => void;
    /**
     * The overwritten username that should be shown at the top of the popover
     */
    overwriteName?: string;

    /**
     * Source URL from the image that should override default image
     */
    overwriteIcon?: string;

    actions?: {
        startOrJoinCallInChannelV2?: (channelID: string) => void;
        joinCall?: (channelID: string) => void;
        openModal?: <P>(modalData: ModalData<P>) => void;
        closeModal?: (ModalIdentifier: string) => void;
    };
}

export type WcContactSheetElement = HTMLElement & {open: () => void; close: () => void};

export const ProfilePopoverController = React.forwardRef<WcContactSheetElement | undefined, ProfilePopoverProps>((props: ProfilePopoverProps, ref: ForwardedRef<WcContactSheetElement | undefined>) => {
    const {
        disabled,
        username,
        hideStatus,
        actions,
        currentUser,
        userStatus,
        user,
        children,
        currentTeamAccountId,
        currentTeamName,
        backgroundColor = 'transparent',
        isExternal = false,
        size = 'md',
        triggerComponentClass = '',
        returnFocus = () => null,
        overwriteName,
        overwriteIcon = user ? Client4.getProfilePictureUrl(user!.id, user!.last_picture_update) : undefined,
        triggerComponentStyle,
    } = props;

    const dispatch = useDispatch();

    const localRef = useRef<WcContactSheetElement | undefined>(undefined);

    useImperativeHandle(ref, () => localRef.current);

    useEffect(() => {
        if (!localRef?.current) {
            return;
        }

        const handleQuickActionClick = (e: CustomEvent) => {
            const {option, user: u} = e.detail;

            if (option.id === 'send-direct-message') {
                getHistory().push(`/${currentTeamName}/messages/@${u.kChatUserName}`);
                e.preventDefault();
            }
            if (option.id === 'start-call') {
                const getDmChannel = async () => {
                    // @ts-ignore
                    const {data} = await dispatch(createDirectChannel(user!.id, currentUser.id));
                    return data.id;
                };

                getDmChannel().then(actions?.startOrJoinCallInChannelV2);
                e.preventDefault();
            }
        };

        localRef.current.addEventListener('close', returnFocus);
        localRef.current.addEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);

        return () => {
            localRef.current?.removeEventListener('close', returnFocus);
            localRef.current?.removeEventListener('quickActionClick', handleQuickActionClick as EventListenerOrEventListenerObject);
        };
    }, [ref]);

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
                background-color={backgroundColor} // TODO
                is-external={isExternal} // TODO
                k-chat-team-name={currentTeamName}
                k-chat-user-name={user?.username || username}
                presence={hideStatus ? undefined : userStatus}
                size={size}
                src={overwriteIcon}
                timezone={user?.timezone?.useAutomaticTimezone ? user?.timezone.automaticTimezone : user?.timezone?.manualTimezone}
                user-id={user?.user_id}
                user-mail={user?.email}
                user-name={overwriteName || user?.first_name + ' ' + user?.last_name}
                style={triggerComponentStyle}
            >
                {Children.map(children, (child) => cloneElement(child as ReactElement, {slot: 'trigger'}))}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
            </wc-contact-sheet>

        </>
    );
});
