import React, {useRef, useState} from 'react';
import type {FC} from 'react';
import {Overlay} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';

import GuestListPopover from 'components/guest_list_popover';
import {getListHeight} from 'components/guest_list_popover/user_list/styled';
import {MAX_LIST_HEIGHT, VIEWPORT_SCALE_FACTOR} from 'components/guest_list_popover/user_list/user_list';

import type {A11yFocusEventDetail} from 'utils/constants';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/keyboard';
import {popOverOverlayPosition} from 'utils/position_utils';
import {getViewportSize} from 'utils/utils';

export type Props = {
    count: number;
    channelId: string;
    guestProfiles: UserProfile[];
}

const HEADER_HEIGHT_ESTIMATE = 130;

const GuestListModal: FC<Props> = ({count, channelId, guestProfiles}) => {
    const ref = useRef<HTMLAnchorElement>(null);

    const [show, setShow] = useState(false);
    const [placement, setPlacement] = useState<"bottom" | "top" | "right" | "left" | undefined>(('top'));
    const [target, setTarget] = useState<HTMLAnchorElement | undefined>();

    const showOverlay = (target?: HTMLAnchorElement) => {
        const targetBounds = ref.current?.getBoundingClientRect();

        if (targetBounds) {
            const approximatePopoverHeight = Math.min(
                (getViewportSize().h * VIEWPORT_SCALE_FACTOR) + HEADER_HEIGHT_ESTIMATE,
                getListHeight(count) + HEADER_HEIGHT_ESTIMATE,
                MAX_LIST_HEIGHT,
            );
            const placement = popOverOverlayPosition(targetBounds, window.innerHeight, approximatePopoverHeight);
            setTarget(target);
            setShow(!show);
            setPlacement(placement);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        showOverlay(e.target as HTMLAnchorElement);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER) || isKeyPressed(e, Constants.KeyCodes.SPACE)) {
            e.preventDefault();

            // Prevent propagation so that the message textbox isn't focused
            e.stopPropagation();
            showOverlay(e.target as HTMLAnchorElement);
        }
    };

    const hideOverlay = () => {
        setShow(false);
    };

    const returnFocus = () => {
        document.dispatchEvent(new CustomEvent<A11yFocusEventDetail>(
            A11yCustomEventTypes.FOCUS, {
                detail: {
                    target: ref.current,
                    keyboardOnly: true,
                },
            },
        ));
    };
    return (
        <>
            <span
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                ref={ref}
                aria-haspopup='dialog'
                role='button'
                slot='trigger'
                tabIndex={0}
            >
                <FormattedMessage
                    tagName={'a'}
                    id='guest_banner.inner'
                    defaultMessage='{count, plural, one {is} other {are}} {count} external {count, plural, one {user} other {users}}'
                    values={{count}}
                />
            </span>
            <Overlay
                placement={placement}
                show={show}
                target={target}
                rootClose={true}
                onHide={hideOverlay}
            >
                <GuestListPopover
                    channelId={channelId}
                    profiles={guestProfiles}
                    hide={hideOverlay}
                    returnFocus={returnFocus}
                    membersCount={count}
                />
            </Overlay>
        </>
    );
};

export default GuestListModal;
