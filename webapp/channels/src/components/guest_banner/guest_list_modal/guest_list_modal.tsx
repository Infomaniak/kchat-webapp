import {
    useFloating,
    autoUpdate,
    autoPlacement,
    flip,
    offset,
    shift,
    useTransitionStyles,
    useClick,
    useDismiss,
    useInteractions,
    useRole,
    FloatingPortal,
} from '@floating-ui/react';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import type {FC} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import GuestListPopover from 'components/guest_list_popover';
import ProfilePopover from 'components/profile_popover/profile_popover';

import {A11yClassNames, OverlaysTimings, OverlayTransitionStyles, RootHtmlPortalId} from 'utils/constants';

import type {GlobalState} from 'types/store';

export type Props = {
    count: number;
    channelId: string;
    guestProfiles: UserProfile[];
}

const GuestListModal: FC<Props> = ({count, channelId, guestProfiles}) => {
    const channel = useSelector((state: GlobalState) => getChannel(state, channelId));
    const channelDisplayName = channel?.display_name || '';
    const [isListOpen, setListOpen] = useState(false);
    const [showUser, setShowUser] = useState<UserProfile | undefined>();

    const {refs: listRefs, floatingStyles: listStyles, context: listContext} = useFloating({
        open: isListOpen,
        onOpenChange: setListOpen,
        placement: 'top',
        whileElementsMounted: autoUpdate,
        middleware: [offset(10), flip(), shift()],
    });

    const {isMounted: isListMounted, styles: listTransition} = useTransitionStyles(listContext, {
        duration: {
            open: OverlaysTimings.FADE_IN_DURATION,
            close: OverlaysTimings.FADE_OUT_DURATION,
        },
        initial: OverlayTransitionStyles.START,
    });

    const listClick = useClick(listContext);
    const listDismiss = useDismiss(listContext);
    const listRole = useRole(listContext);
    const {getReferenceProps: getListRefProps, getFloatingProps: getListFloatingProps} = useInteractions([listClick, listDismiss, listRole]);

    const isProfileOpen = showUser !== undefined;
    const {refs: profileRefs, floatingStyles: profileStyles, context: profileContext} = useFloating({
        open: isProfileOpen,
        onOpenChange: (open) => {
            if (!open) {
                setShowUser(undefined);
                setListOpen(true);
            }
        },
        placement: 'top',
        whileElementsMounted: autoUpdate,
        middleware: [offset(10), autoPlacement(), shift()],
    });

    const {isMounted: isProfileMounted, styles: profileTransition} = useTransitionStyles(profileContext, {
        duration: {
            open: OverlaysTimings.FADE_IN_DURATION,
            close: OverlaysTimings.FADE_OUT_DURATION,
        },
        initial: OverlayTransitionStyles.START,
    });

    const profileDismiss = useDismiss(profileContext);
    const profileRole = useRole(profileContext);
    const {getFloatingProps: getProfileFloatingProps} = useInteractions([profileDismiss, profileRole]);

    const setReference = useCallback((node: HTMLSpanElement | null) => {
        listRefs.setReference(node);
        profileRefs.setReference(node);
    }, [listRefs, profileRefs]);

    const handleHide = useCallback(() => {
        setListOpen(false);
    }, []);

    const showUserOverlay = useCallback((user: UserProfile) => {
        setListOpen(false);
        setShowUser(user);
    }, []);

    const hideUserOverlay = useCallback(() => {
        setShowUser(undefined);
        setListOpen(true);
    }, []);

    return (
        <>
            <span
                ref={setReference}
                {...getListRefProps()}
                role='button'
                tabIndex={0}
            >
                <FormattedMessage
                    tagName={'a'}
                    id='guest_banner.inner'
                    defaultMessage='{count, plural, one {is} other {are}} {count} external {count, plural, one {user} other {users}}'
                    values={{count}}
                />
            </span>

            {isListMounted && (
                <FloatingPortal id={RootHtmlPortalId}>
                    <div
                        ref={listRefs.setFloating}
                        style={{...listStyles, ...listTransition, zIndex: 1000}}
                        className={A11yClassNames.POPUP}
                        {...getListFloatingProps()}
                    >
                        <GuestListPopover
                            channelId={channelId}
                            channelDisplayName={channelDisplayName}
                            profiles={guestProfiles}
                            hide={handleHide}
                            returnFocus={() => {}}
                            membersCount={count}
                            showUserOverlay={showUserOverlay}
                        />
                    </div>
                </FloatingPortal>
            )}

            {isProfileMounted && showUser && (
                <FloatingPortal id={RootHtmlPortalId}>
                    <div
                        ref={profileRefs.setFloating}
                        style={{...profileStyles, ...profileTransition, zIndex: 1000}}
                        className={classNames('user-profile-popover', A11yClassNames.POPUP)}
                        {...getProfileFloatingProps()}
                    >
                        <ProfilePopover
                            userId={showUser.id}
                            src={Client4.getProfilePictureUrl(showUser.id, showUser.last_picture_update)}
                            channelId={channelId}
                            hide={hideUserOverlay}
                            returnFocus={() => {}}
                        />
                    </div>
                </FloatingPortal>
            )}
        </>
    );
};

export default GuestListModal;
