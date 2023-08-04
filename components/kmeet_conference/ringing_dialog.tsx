// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import IconButton from '@infomaniak/compass-components/components/icon-button';

import * as React from 'react';

import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {hangUpCall, startOrJoinCallInChannel} from 'actions/calls';
import GenericModal from 'components/generic_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import './ringing_dialog.scss';

import {UserProfile} from '@mattermost/types/users';

import Avatars from 'components/widgets/users/avatars';

import {callParameters} from 'selectors/calls';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {stopRing} from 'utils/notification_sounds';

function DialingModal() {
    const dispatch = useDispatch<DispatchFunc>();
    const {users, caller} = useSelector(callParameters);
    const modalRef = React.useRef<HTMLDivElement>(null);

    //manage to stop de tone when users click outside modal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutsideModal = (event: any) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onHandleDecline(event);
        }
    };
    document.addEventListener('click', handleClickOutsideModal);

    React.useEffect(() => {
        window.addEventListener('offline', (e) => {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
            stopRing();
        });
        return () => {
            document.removeEventListener('click', handleClickOutsideModal);
        };
    }, []);

    const onHandleAccept = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(startOrJoinCallInChannel());
    };

    const onHandleDecline = (e: React.SyntheticEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(hangUpCall());
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
        >
            <div ref={modalRef}>
                <div
                    className='content-body'
                >
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
                    />
                </div>
            </div>
        </GenericModal>
    </>
    );
}

export default DialingModal;
