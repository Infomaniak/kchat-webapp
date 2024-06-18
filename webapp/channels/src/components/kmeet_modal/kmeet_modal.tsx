import classNames from 'classnames';
import React, {useEffect, useMemo} from 'react';
import type {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {GenericModal} from '@mattermost/components';
import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users.js';

import {getUser} from 'mattermost-redux/actions/users';

import {joinCall, declineCall, cancelCall} from 'actions/kmeet_calls';
import {closeModal} from 'actions/views/modals';

import Avatars from 'components/kmeet_conference/avatars';
import CallAccept from 'components/widgets/icons/call_accept';
import CallHangUp from 'components/widgets/icons/call_hang_up';

import {ModalIdentifiers} from 'utils/constants';
import {ringing, stopRing} from 'utils/notification_sounds';
import {isDesktopApp} from 'utils/user_agent';

import type {Conference} from 'types/conference';

import './kmeet_modal.scss';

type Props = {
    user: UserProfile;
    channel: Channel;
    conference?: Conference;
    caller?: UserProfile;
    users?: UserProfile[];
}

const KmeetModal: FC<Props> = ({channel, conference, caller, users, user}) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const modalRef = React.useRef<HTMLDivElement>(null);

    const isCallerCurrentUser = useMemo(() => caller?.id === user.id, [caller, user]);
    const participants = useMemo(() => (users ? users.filter((u) => u.id !== user.id) : []), [users, user]);

    const textButtonAccept = formatMessage({id: 'calling_modal.button.accept', defaultMessage: 'Accept'});
    const textButtonDecline = formatMessage({id: 'calling_modal.button.decline', defaultMessage: 'Decline'});
    const textButtonCancel = formatMessage({id: 'calling_modal.button.cancel', defaultMessage: 'Cancel'});

    const onHandleAccept = React.useCallback(() => {
        if (conference) {
            dispatch(joinCall(conference.channel_id));
        }
    }, [dispatch, conference]);

    const onHandleDecline = React.useCallback(() => {
        if (conference) {
            dispatch(declineCall(conference.channel_id));
        }
    }, [dispatch, conference]);

    const onHandleCancel = React.useCallback(() => {
        if (conference) {
            dispatch(cancelCall(conference.channel_id));
        }
    }, [dispatch, conference]);

    if (
        caller.id in conference?.registrants &&
        (conference?.registrants[caller.id].status === 'approved' || conference?.registrants[caller.id].status === 'denied')
    ) {
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
    }

    // const handleClickOutsideModal = useCallback((event: any) => {
    //     if (modalRef.current && !modalRef.current.contains(event.target)) {
    //         onHandleDecline();
    //     }
    // }, [onHandleDecline]);

    useEffect(() => {
        window.addEventListener('offline', () => {
            onHandleDecline();
        });

        // document.addEventListener('click', handleClickOutsideModal);

        // const timeout = setTimeout(() => {
        //     onHandleDecline();
        // }, 30000);

        // return () => {
        //     // document.removeEventListener('click', handleClickOutsideModal);
        //     clearTimeout(timeout);
        // };
    }, [onHandleDecline]);

    useEffect(() => {
        ringing('Ring');

        return () => {
            stopRing();
        };
    }, []);

    useEffect(() => {
        if (!caller && conference) {
            dispatch(getUser(conference.id));
        }
    }, [caller, conference, dispatch]);

    const getUsersNicknames = (users: UserProfile[]): string => {
        const nicknames = users.map((user) => user.nickname);
        return nicknames.join(', ');
    };

    const text = () => {
        switch (channel.type) {
        case 'O':
        case 'P':
            return (<>
                <div className='call-modal__calling-user'>
                    <span>
                        {getUsersNicknames(participants)}
                    </span>
                </div>
                <div className='call-modal__calling-info'>
                    <>
                        <FormattedMessage
                            id='calling_modal.calling.teams'
                            defaultMessage='is calling in'
                        />
                    </>
                </div>
                <div className='call-modal__calling-user'>
                    <span>
                        {channel.display_name}
                    </span>
                </div>
            </>);
        case 'G':
        case 'D':
            return (
                <>
                    <div className='call-modal__calling-user'>
                        <span>
                            {getUsersNicknames(participants)}
                        </span>
                    </div>
                    <div className='call-modal__calling-info'>
                        {
                            isCallerCurrentUser ? (
                                <FormattedMessage
                                    id='calling_modal.call_in_progress'
                                    defaultMessage='call in progress...'
                                />
                            ) : (
                                <FormattedMessage
                                    id='calling_modal.calling'
                                    defaultMessage='is calling...'
                                />
                            )
                        }
                    </div>
                </>
            );
        default:
            return '';
        }
    };

    const Container = isDesktopApp() === false ? GenericModal : 'div';

    return (
        <Container
            backdrop='static'
            keyboardEscape={false}
            className={classNames('call-modal CallRingingModal', {
                desktop: isDesktopApp(),
            })}
            aria-labelledby='contained-modal-title-vcenter'
        >
            <div
                ref={modalRef}
            >
                <div
                    className='call-modal__header'
                >
                    <Avatars
                        channelId={channel.id}
                        showCurrentUser={false}
                        size='lg'
                        disableProfileOverlay={false}
                        displayProfileStatus={false}
                    />
                </div>
                <div className='call-modal__text'>
                    {text()}
                </div>
                <div
                    className='call-modal__actions'
                >
                    {isCallerCurrentUser === false ? (
                        <>
                            <button
                                className='btn btn-grey decline'
                                onClick={onHandleDecline}
                                aria-label={textButtonDecline}
                            >
                                <CallHangUp/>
                                {textButtonDecline}
                            </button>
                            <button
                                className='btn btn-primary accept'
                                onClick={onHandleAccept}
                                aria-label={textButtonAccept}
                            >
                                <CallAccept/>
                                {textButtonAccept}
                            </button>
                        </>
                    ) : (
                        <button
                            className='btn btn-grey decline'
                            onClick={onHandleCancel}
                            aria-label={textButtonCancel}
                        >
                            <CallHangUp/>
                            {textButtonCancel}
                        </button>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default KmeetModal;
