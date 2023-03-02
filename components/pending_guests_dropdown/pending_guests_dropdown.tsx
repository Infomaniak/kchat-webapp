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
import {openModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

import DropdownIcon from 'components/widgets/icons/fa_dropdown_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import CancelMultipleInvitesModal from 'components/cancel_mutiple_invites_modal';

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
            if (pendingGuest.data?.channel_ids?.length > 1) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.CANCEL_MULTIPLE_INVITES,
                    dialogType: CancelMultipleInvitesModal,
                    dialogProps: {
                        currentChannelId: channel.id,
                        channelIds: pendingGuest.data.channel_ids,
                        pendingGuestKey: pendingGuest.key,
                    },
                }));
                return;
            }
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
                    <span className='sr-only'>{pendingGuest.email}</span>
                    <span className='pr-1'>
                        <FormattedMessage
                            id='pending_guests_dropdown.role'
                            defaultMessage='Pending guest'
                        />
                    </span>
                    <DropdownIcon/>
                </button>
                <Menu
                    openLeft={true}
                    openUp={totalUsers > ROWS_FROM_BOTTOM_TO_OPEN_UP && totalUsers - index <= ROWS_FROM_BOTTOM_TO_OPEN_UP}
                    ariaLabel={formatMessage({id: 'pending_guests_dropdown.cancel', defaultMessage: 'Cancel invitation'})}
                >
                    <Menu.ItemAction
                        show={canCancelPendingGuestInvite}
                        onClick={handleCancelPendingGuestInvite}
                        text={formatMessage({id: 'pending_guests_dropdown.cancel', defaultMessage: 'Cancel invitation'})}
                        isDangerous={true}
                    />
                </Menu>
            </MenuWrapper>
        );
    }

    return (
        <div>
            <FormattedMessage
                id='pending_guests_dropdown.role'
                defaultMessage='Pending guest'
            />
        </div>
    );
};

export default PendingGuestsDropdown;
