import React, {useEffect, useMemo} from 'react';
import type {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users.js';

import {joinCall, declineCall, leaveCall} from 'actions/kmeet_calls';

import Avatars from 'components/widgets/users/avatars';

import './kmeet_modal.scss';
import type {Conference} from 'types/conference';

type Props = {
    user: UserProfile;
    channel: Channel;
    conference: Conference;
    caller: UserProfile;
    users: UserProfile[];
}

const KmeetModal: FC<Props> = ({channel, conference, caller, users, user}) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const onHandleAccept = React.useCallback(() => {
        dispatch(joinCall(channel.id));
    }, [dispatch, channel]);

    const onHandleDecline = React.useCallback(() => {
        dispatch(declineCall(conference.id));
    }, [dispatch, conference]);

    const onHandleCancel = React.useCallback(() => {
        dispatch(leaveCall(channel.id));
    }, [dispatch, channel]);

    useEffect(() => {
        window.addEventListener('offline', () => {
            onHandleDecline();
        });
        const timeout = setTimeout(() => {
            onHandleDecline();
        }, 30000);
        return () => {
            clearTimeout(timeout);
        };
    }, [onHandleDecline]);

    const getUsersForOverlay = () => {
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
                            {getUsersNicknames(getUsersForOverlay())}
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
        default:
            return '';
        }
    };

    const isCallerCurrentUser = useMemo(() => caller.id === user.id, [caller, user]);
    const textButtonAccept = formatMessage({id: 'calling_modal.button.accept', defaultMessage: 'Accept'});
    const textButtonDecline = formatMessage({id: 'calling_modal.button.decline', defaultMessage: 'Decline'});
    const textButtonCancel = formatMessage({id: 'calling_modal.button.cancel', defaultMessage: 'Cancel'});

    return (
        <div
            className='call-modal'
        >
            <div>
                <div
                    className='call-modal__header'
                >
                    <Avatars
                        userIds={conference.participants}
                        size='xl'
                        totalUsers={users.length}
                        disableProfileOverlay={true}
                        disablePopover={true}
                        fetchMissingUsers={false}
                        disableButton={true}
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
                                className='btn btn-tertiary decline'
                                onClick={onHandleDecline}
                                aria-label={textButtonDecline}
                            >{textButtonDecline}</button>
                            <button
                                className='btn btn-primary accept'
                                onClick={onHandleAccept}
                                aria-label={textButtonAccept}
                            >{textButtonAccept}</button>
                        </>
                    ) : (
                        <button
                            className='btn btn-tertiary decline'
                            onClick={onHandleCancel}
                            aria-label={textButtonCancel}
                        >{textButtonCancel}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KmeetModal;
