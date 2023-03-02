// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import {cancelPendingGuestInvite} from 'mattermost-redux/actions/channels';
import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

import {GenericModal} from '@mattermost/components';

type Props = {
    currentChannelId: string;
    channelIds: string[];
    pendingGuestKey: string;
}

const CancelMultipleInvitesModal = ({currentChannelId, channelIds, pendingGuestKey}: Props) => {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CANCEL_MULTIPLE_INVITES));

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.CANCEL_MULTIPLE_INVITES));
    }, [dispatch]);

    const handleCancelPendingGuestInvite = useCallback(() => {
        dispatch(cancelPendingGuestInvite(currentChannelId, pendingGuestKey));
    }, [dispatch, currentChannelId, pendingGuestKey]);

    const header = (
        <FormattedMessage
            id='cancel_multiple_invites_modal'
            defaultMessage='Cancel multiple invitations'
        />
    );

    return (
        <GenericModal
            id='CancelMultipleInvitesModal'
            show={show}
            onExited={handleClose}
            handleCancel={handleClose}
            handleConfirm={handleCancelPendingGuestInvite}
            modalHeaderText={header}
        >
            <FormattedMessage
                id='cancel_multiple_invites_modal'
                defaultMessage='By cancelling this invitation, you will also cancel invitations in the following channels:\n{channelList}'
                values={{
                    channelList: channelIds.join(),
                }}
            />
        </GenericModal>
    );
};

export default CancelMultipleInvitesModal;
