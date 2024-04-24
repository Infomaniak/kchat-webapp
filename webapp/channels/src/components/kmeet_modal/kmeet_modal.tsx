import Button from '@infomaniak/compass-components/components/button';
import React, {useEffect} from 'react';
import type {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users.js';

import {hangUpCall, joinCallInChannel} from 'actions/calls';
import {callParameters} from 'selectors/calls';

import Avatars from 'components/widgets/users/avatars';

import './kmeet_modal.scss';
import type {Conference} from 'types/conference';

type Props = {
    user: UserProfile;
    locale: string;
    channel: Channel;
    conference: Conference;
    caller: UserProfile;
    users: UserProfile[];
}

const KmeetModal: FC<Props> = ({user, locale, channel, conference, caller, users}) => {
    const dispatch = useDispatch();
    const modalRef = React.useRef<HTMLDivElement>(null);
    const {formatMessage} = useIntl();

    console.log('channel', channel);
    console.log('caller', caller);
    console.log('users', users);

    const onHandleAccept = React.useCallback(() => {
        dispatch(joinCallInChannel());
    }, [dispatch]);

    const onHandleDecline = React.useCallback(() => {
        dispatch(hangUpCall());
    }, [dispatch]);

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
            return 'Hello world';
        }
    };

    const textButtonAccept = formatMessage({id: 'calling_modal.button.accept', defaultMessage: 'Accept'});
    const textButtonDecline = formatMessage({id: 'calling_modal.button.decline', defaultMessage: 'Decline'});

    return (
        <div ref={modalRef}>
            <div
                className='content-body'
            >
                {/* <Avatars
                    userIds={getUsersForOverlay().map((usr) => usr.id)}
                    size='xl'
                    totalUsers={users.length}
                    disableProfileOverlay={true}
                    disablePopover={true}
                    disableButton={true}
                /> */}
            </div>
            <div className='content-calling'>
                {text()}
            </div>
            <div className='content-calling'/>
            <div
                className='content-actions'
            >
                {/* <Button
                    className='decline'
                    size={'md'}
                    onClick={onHandleDecline}
                    inverted={true}
                    aria-label='Decline'
                    label={textButtonDecline}
                />
                <Button
                    className='accept'
                    size={'md'}
                    onClick={onHandleAccept}
                    inverted={true}
                    aria-label='Accept'
                    label={textButtonAccept}
                /> */}
            </div>
        </div>
    );
};

export default KmeetModal;
