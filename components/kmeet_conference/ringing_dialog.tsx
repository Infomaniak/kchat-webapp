// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import IconButton from '@infomaniak/compass-components/components/icon-button';

import * as React from 'react';

import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {hangUpCall, startOrJoinCallInChannel} from 'actions/calls';
import {closeModal} from 'actions/views/modals';
import GenericModal from 'components/generic_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {ModalIdentifiers} from 'utils/constants';
import './ringing_dialog.scss';
import {Post} from '@mattermost/types/posts';

import {UserProfile} from '@mattermost/types/users';

import Avatars from 'components/widgets/users/avatars';

import {ringing, stopRing} from 'utils/notification_sounds';
import {callParameters} from 'selectors/calls';

type Props = {
    onClose?: () => void;
}

function DialingModal(props: Props) {
    const dispatch = useDispatch<DispatchFunc>();
    const {users, caller} = useSelector(callParameters);
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const actionRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        actionRef.current?.focus();
        btnRef.current?.focus();
        ringing('Ring');

        return () => {
            stopRing();
        };
    }, []);

    //Draft: fix for Safari still some issue on firstload
    const ringTone = () => {
        ringing('Ring');
        stopRing();
        document.body.removeEventListener('click', ringTone);
        document.body.removeEventListener('touchstart', ringTone);
    };
    document.body.addEventListener('click', ringTone);
    document.body.addEventListener('touchstart', ringTone);

    const handleOnClose = () => {
        if (props.onClose) {
            props.onClose();
        }
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
    };

    const onHandleAccept = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(startOrJoinCallInChannel());
        handleOnClose();
    };

    const onHandleDecline = (e: React.SyntheticEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(hangUpCall());
        handleOnClose();
    };

    const getUsersForOvelay = () => {
        if (users.length >= 2) {
            const overlayUsers: UserProfile[] = [caller];
            const getOverLayUser: UserProfile = users.filter((usr) => usr.id !== caller.id)[0];
            overlayUsers.push(getOverLayUser);
            return overlayUsers;
        }
        return [caller];
    };
    const getUsersNicknames = (users: UserProfile[]): string => {
        const nicknames = users.map((user) => user.nickname);
        return nicknames.join(', ');
    };

    return (<>
        <GenericModal
            aria-labelledby='contained-modal-title-vcenter'
            className='CallRingingModal'
            onExited={handleOnClose}
        >
            <div ref={actionRef}>
                <div className='content-body'>
                    <Avatars
                        userIds={getUsersForOvelay().map((usr) => usr.id)}
                        size='call'
                        totalUsers={users.length}
                        disableProfileOverlay={true}
                        disablePopover={true}
                        disableButton={true}
                    />
                </div>
                <div className='content-calling'>
                    {users && (
                        <>
                            <div className='content-calling__user'>
                                <span>
                                    {getUsersNicknames(getUsersForOvelay())}
                                </span>
                            </div>
                            <div className='content-calling__info'>
                                <>
                                    <FormattedMessage
                                        id='calling_modal.calling'
                                        defaultMessage='iscalling'
                                    />
                                </>
                            </div>
                        </>
                    )}
                </div>
                <div className='content-calling'/>
                <div
                    className='content-actions'
                >
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
                        ref={btnRef}
                    />
                </div>
            </div>
        </GenericModal>
    </>
    );
}

export default DialingModal;
