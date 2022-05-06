// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import IconButton from '@mattermost/compass-components/components/icon-button';

import GenericModal from 'components/generic_modal';

import Avatars from 'components/widgets/users/avatars';

// import {Client4} from 'mattermost-redux/client';
import {UserProfile} from 'mattermost-redux/types/users';
import {startOrJoinCallInChannel} from 'actions/calls';

import './ringing_dialog.scss';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {GlobalState} from 'types/store';

type Props = {
    onClose?: () => void;
    calling: {
        users: {[userID: string]: UserProfile};
        channelID: string;
    };
}

function DialingModal(props: Props) {
    const {users, channelID} = props.calling;
    const dispatch = useDispatch<DispatchFunc>();
    const connectedChannelID = useSelector((state: GlobalState) => state.views.calls.connectedChannelID);

    const handleOnClose = () => {
        if (props.onClose) {
            props.onClose();
        }
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
    };
    const onHandleAccept = (e: MouseEvent) => {
        // const data = await Client4.acceptIncomingMeetCall(channelID);
        // console.log(data);

        e.preventDefault();
        e.stopPropagation();
        dispatch(startOrJoinCallInChannel(channelID, props.calling.channelID));
    };
    const onHandleDecline = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleOnClose();

        // Client4.declineIncomingMeetCall(channelID);
    };

    if (connectedChannelID) {
        return null;
    }

    return (
        <GenericModal
            aria-labelledby='contained-modal-title-vcenter'
            className='CallRingingModal'
            onExited={handleOnClose}
        >
            <div className='content-body'>
                {users && (
                    <Avatars
                        userIds={Object.keys(users)}
                        size='xl'
                    />
                )}
            </div>
            <div className='content-actions'>
                <IconButton
                    className='accept'
                    size={'md'}
                    icon={'cellphone'}
                    onClick={onHandleAccept}
                    inverted={true}
                    aria-label='Accept'
                />
                <IconButton
                    className='decline'
                    size={'md'}
                    icon={'minus'}
                    onClick={onHandleDecline}
                    inverted={true}
                    aria-label='Decline'
                />
            </div>
        </GenericModal>
    );
}

export default DialingModal;
