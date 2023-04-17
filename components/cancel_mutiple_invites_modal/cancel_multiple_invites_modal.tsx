// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {Modal} from 'react-bootstrap';
import styled from 'styled-components';

import {cancelPendingGuestInvite} from 'mattermost-redux/actions/channels';
import {makeGetChannelsForIds} from 'mattermost-redux/selectors/entities/channels';
import {closeModal} from 'actions/views/modals';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import Constants, {ModalIdentifiers} from 'utils/constants';

const StyledChannel = styled.div`
    padding: 10px 12px;
    font-weight: bold;
    border-radius: 8px;
    :hover {
        background-color: rgba(var(--center-channel-color-rgb),0.08);
    }
`;

type Props = {
    currentChannelId: string;
    channelIds: string[];
    pendingGuestKey: string;
}

const CancelMultipleInvitesModal = ({currentChannelId, channelIds, pendingGuestKey}: Props) => {
    const dispatch = useDispatch();
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.CANCEL_MULTIPLE_INVITES));
    const getChannelsForIds = makeGetChannelsForIds();
    const channels = useSelector((state: GlobalState) => getChannelsForIds(state, channelIds));

    const handleClose = useCallback(() => {
        dispatch(closeModal(ModalIdentifiers.CANCEL_MULTIPLE_INVITES));
    }, [dispatch]);

    const handleCancelPendingGuestInvite = useCallback(() => {
        dispatch(cancelPendingGuestInvite(currentChannelId, pendingGuestKey));
        handleClose();
    }, [dispatch, currentChannelId, pendingGuestKey, handleClose]);

    const channelList = channels.map((channel) => (
        <StyledChannel key={`cancel-multiple-invites-channel-${channel.id}`}>
            {channel.type === Constants.PRIVATE_CHANNEL ? (
                <i className='icon icon-lock-outline'/>
            ) : (
                <i className='icon icon-globe'/>
            )}
            {channel.display_name}
        </StyledChannel>
    ));

    return (
        <Modal
            id='CancelMultipleInvitesModal'
            show={show}
            onHide={handleClose}
            onExited={handleClose}
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='cancelMultipleInvitesModal'
                >
                    <FormattedMessage
                        id='cancel_multiple_invites_modal.header'
                        defaultMessage='Cancel multiple invitations'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='alert alert-danger'>
                    <FormattedMessage
                        id='cancel_multiple_invites_modal.content'
                        defaultMessage='By cancelling this invitation, you will also cancel invitations in the following channels :'
                    />
                </div>
                <div className='pb-1'>
                    {channelList}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-link secondary'
                    onClick={handleClose}
                >
                    <FormattedMessage
                        id='generic_modal.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleCancelPendingGuestInvite}
                    autoFocus={true}
                >
                    <FormattedMessage
                        id='generic_modal.confirm'
                        defaultMessage='Confirm'
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default CancelMultipleInvitesModal;
