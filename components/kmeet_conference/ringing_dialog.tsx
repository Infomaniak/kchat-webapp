// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import IconButton from '@infomaniak/compass-components/components/icon-button';

import * as React from 'react';

import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {UserProfile} from 'mattermost-redux/types/users';

import {startOrJoinCallInChannel} from 'actions/calls';
import {closeModal} from 'actions/views/modals';
import GenericModal from 'components/generic_modal';
import Avatars from 'components/widgets/users/avatars';
import {DispatchFunc} from 'mattermost-redux/types/actions';

// import {Client4} from 'mattermost-redux/client';
import bing from 'sounds/bing.mp3';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';
import './ringing_dialog.scss';
import {Post} from '@mattermost/types/posts';
import {Client4} from 'mattermost-redux/client';
type Props = {
    onClose?: () => void;
    calling?: {
        users: {[userID: string]: UserProfile};
        channelID: string;
        userCalling: string;
    };
    post: Post;
    currentUserId: string;
}

function DialingModal(props: Props) {
    const dispatch = useDispatch<DispatchFunc>();
    const users: UserProfile[] = useSelector((state: GlobalState) => state.views.calls.kmeetRinging.user);
    const caller: UserProfile[] = useSelector((state: GlobalState) => state.views.calls.kmeetRinging.caller);
    const handleOnClose = () => {
        if (props.onClose) {
            props.onClose();
        }
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
    };
    const onHandleAccept = (e: React.SyntheticEvent) => {
        Client4.acceptIncomingMeetCall(props.post!.channel_id);
        e.preventDefault();
        e.stopPropagation();
        dispatch(startOrJoinCallInChannel(props.post.channel_id));
        handleOnClose();
    };
    const onHandleDecline = (e: React.SyntheticEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleOnClose();
        Client4.declineIncomingMeetCall(props.post.channel_id);
    };

    const usersWithoutCurrent = users.filter((user: UserProfile) => user.id !== props.currentUserId);
    const usersLenght = usersWithoutCurrent.length;
    const getNickname = (len: number) => {
        const nicknames: string[] = usersWithoutCurrent.map((usr: UserProfile) => (usr.nickname));
        if (len > 2) {
            nicknames.splice(2, nicknames.length - 2, '...');
        }
        return nicknames.toString();
    };

    const audio = new Audio(bing);

    audio.play();

    return (
        <GenericModal
            aria-labelledby='contained-modal-title-vcenter'
            className='CallRingingModal'
            onExited={handleOnClose}
        >

            <div className='content-body'>
                {users && usersWithoutCurrent.length <= 2 && (
                    <Avatars
                        userIds={usersWithoutCurrent.map((usr: UserProfile) => usr.id)}
                        size='xl'
                        totalUsers={usersWithoutCurrent.length}
                    />
                )}
                {users && usersWithoutCurrent.length > 2 && caller && (
                    <Avatars
                        userIds={caller.map((usr) => usr.id)}
                        size='xl'
                        totalUsers={usersWithoutCurrent.length}
                    />
                )}
            </div>
            <div className='content-calling'>
                {users && (
                    <>
                        <div className='content-calling__user'>
                            <span>
                                {getNickname(usersLenght)}
                            </span>
                        </div>
                        <div className='content-calling__info'>
                            <>
                                <FormattedMessage
                                    id='calling_modal.alling'
                                    defaultMessage='calling'
                                />
                            </>
                        </div>
                    </>
                )}
            </div>
            <div className='content-calling'/>
            <div className='content-actions'>
                <IconButton
                    className='decline'
                    size={'md'}
                    icon={'close'}
                    onClick={onHandleDecline}
                    inverted={true}
                    aria-label='Decline'
                    label='Decline'
                />
                <IconButton
                    className='accept'
                    size={'md'}
                    icon={'check'}
                    onClick={onHandleAccept}
                    inverted={true}
                    aria-label='Accept'
                    label='Accept'
                />
            </div>

        </GenericModal>
    );
}

export default DialingModal;
