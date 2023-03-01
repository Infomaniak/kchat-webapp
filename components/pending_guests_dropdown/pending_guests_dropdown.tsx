// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {cancelPendingGuestInvite} from 'mattermost-redux/actions/channels';
import {haveICurrentTeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {GlobalState} from '@mattermost/types/store';
import {Channel, PendingGuest} from '@mattermost/types/channels';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

type Props = {
    channel: Channel;
    pendingGuest: PendingGuest;
    index: number;
    totalUsers: number;
};

const ROWS_FROM_BOTTOM_TO_OPEN_UP = 2;

const PendingGuestsDropdown = ({channel, pendingGuest, index, totalUsers}: Props) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const canCancelPendingGuestInvite = useSelector((state: GlobalState) => haveICurrentTeamPermission(state, Permissions.INVITE_GUEST));

    const handleCancelPendingGuestInvite = () => {
        if (pendingGuest) {
            dispatch(cancelPendingGuestInvite(channel.id, pendingGuest.key));
        }
    };

    if (canCancelPendingGuestInvite) {
        return (
            <MenuWrapper>
                <button
                    className='dropdown-toggle theme color--link style--none'
                    type='button'
                >
                    <span>
                        <FormattedMessage
                            id='pending_guests_dropdown.role'
                            defaultMessage='Pending Guest'
                        />
                    </span>
                    <DropdownIcon/>
                </button>
                <Menu
                    openLeft={true}
                    openUp={totalUsers > ROWS_FROM_BOTTOM_TO_OPEN_UP && totalUsers - index <= ROWS_FROM_BOTTOM_TO_OPEN_UP}
                    ariaLabel={formatMessage({id: 'pending_guests_dropdown.cancel', defaultMessage: 'Cancel pending guest invite'})}
                >
                    <Menu.ItemAction
                        show={canCancelPendingGuestInvite}
                        onClick={handleCancelPendingGuestInvite}
                        text={formatMessage({id: 'pending_guests_dropdown.cancel_action', defaultMessage: 'Cancel Invite'})}
                        isDangerous={true}
                    />
                </Menu>
            </MenuWrapper>
        );
    }

    return (
        <div>
            <FormattedMessage
                id='channel_members_dropdown.channel_pending_guest'
                defaultMessage='Pending Guest'
            />
        </div>
    );
};

export default PendingGuestsDropdown;
