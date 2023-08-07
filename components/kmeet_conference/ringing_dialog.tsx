// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import IconButton from '@infomaniak/compass-components/components/icon-button';

import * as React from 'react';

import {FormattedMessage, useIntl} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {hangUpCall, joinCallInChannel} from 'actions/calls';
import GenericModal from 'components/generic_modal';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import './ringing_dialog.scss';

import {UserProfile} from '@mattermost/types/users';

import Avatars from 'components/widgets/users/avatars';

import {callParameters} from 'selectors/calls';

type PropsType={
    toneTimeOut: number;
}

function DialingModal({toneTimeOut}: PropsType) {
    const dispatch = useDispatch<DispatchFunc>();
    const {users, caller, channel} = useSelector(callParameters);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const {formatMessage} = useIntl();

    const handleClickOutsideModal = (event: any) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onHandleDecline();
        }
    };
    document.addEventListener('click', handleClickOutsideModal);

    React.useEffect(() => {
        window.addEventListener('offline', () => {
            onHandleDecline();
        });
        return () => {
            document.removeEventListener('click', handleClickOutsideModal);
        };
    }, []);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onHandleDecline();
        }, toneTimeOut);
        return () => clearTimeout(timeout);
    }, []);

    const onHandleAccept = () => {
        dispatch(joinCallInChannel());
    };

    const onHandleDecline = () => {
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

    const text = () => {
        switch (channel.type) {
        case 'O':
        case 'P':
            return (<>
                <div className='content-calling__info'>
                    <>
                        <FormattedMessage
                            id='calling_modal.calling.teams'
                            defaultMessage='is calling in'
                        />
                    </>
                </div>
                <div className='content-calling__user'>
                    <span>
                        {channel.display_name}
                    </span>
                </div>
            </>);
        case 'G':
        case 'D':
            return (
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
                                defaultMessage='is calling'
                            />
                        </>
                    </div>
                </>
            );
        }
    };
    const textButtonAccept = formatMessage({id: 'calling_modal.button.accept', defaultMessage: 'Accept'});
    const textButtonDecline = formatMessage({id: 'calling_modal.button.decline', defaultMessage: 'Decline'});
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
                    {text()}
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
                        label={textButtonDecline}
                    />
                    <IconButton
                        className='accept'
                        size={'md'}
                        icon={'check'}
                        onClick={onHandleAccept}
                        inverted={true}
                        aria-label='Accept'
                        label={textButtonAccept}
                    />
                </div>
            </div>
        </GenericModal>
    </>
    );
}

export default DialingModal;
