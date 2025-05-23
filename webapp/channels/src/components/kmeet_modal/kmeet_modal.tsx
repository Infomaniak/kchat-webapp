import classNames from 'classnames';
import React, {useEffect, useMemo, useState} from 'react';
import type {FC} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {GenericModal} from '@mattermost/components';
import type {Channel} from '@mattermost/types/channels';
import type {UserProfile} from '@mattermost/types/users.js';

import {bridgeRecreate} from 'mattermost-redux/actions/ksuiteBridge';
import {getUser} from 'mattermost-redux/actions/users';
import {setLastKSuiteSeenCookie} from 'mattermost-redux/utils/team_utils';

import {joinCall, declineCall, cancelCall, getRemoteUsers} from 'actions/kmeet_calls';
import {switchTeam} from 'actions/team_actions';
import {closeModal} from 'actions/views/modals';

import KMeetAvatars from 'components/kmeet_conference/avatars';
import CallAccept from 'components/widgets/icons/call_accept';
import CallHangUp from 'components/widgets/icons/call_hang_up';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {ring, stopRing} from 'utils/notification_sounds';
import {isDesktopApp} from 'utils/user_agent';

import type {Conference} from 'types/conference';
import type {Server} from 'types/store/servers';

import './kmeet_modal.scss';

type Props = {
    user: UserProfile;
    channel?: Channel;
    conference?: Conference;
    caller?: UserProfile;
    users?: UserProfile[];
    crossServerEvent: any;
    otherServer: Server | null | undefined;
    otherServerName: string | undefined;
}

const KmeetModal: FC<Props> = ({channel, conference, caller, users, user, crossServerEvent, otherServer, otherServerName}) => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const modalRef = React.useRef<HTMLDivElement>(null);
    const isCallerCurrentUser = useMemo(() => caller?.id === user.id, [caller, user]);
    const participants = useMemo(() => {
        if (!users || !user) {
            return [];
        }
        return users.filter((u) => u && u.id !== user.id);
    }, [users, user]);
    const textButtonAccept = formatMessage({id: 'calling_modal.button.accept', defaultMessage: 'Accept'});
    const textButtonDecline = formatMessage({id: 'calling_modal.button.decline', defaultMessage: 'Decline'});
    const textButtonCancel = formatMessage({id: 'calling_modal.button.cancel', defaultMessage: 'Cancel'});
    const [otherServerParticipants, setOtherServerParticipants] = useState<UserProfile[]>([]);

    const onHandleAccept = React.useCallback(() => {
        if (conference && !crossServerEvent) {
            dispatch(joinCall(conference.channel_id));
        } else if (crossServerEvent) {
            if (!otherServer) {
                return;
            }
            bridgeRecreate(otherServer.url);
            switchTeam(otherServer.url, otherServer);
            setLastKSuiteSeenCookie(otherServer.id);
            const urlWithConferenceId = `${otherServer.url}/${otherServer.name}/channels/${Constants.DEFAULT_CHANNEL}/?cid=${crossServerEvent.data.channel_id}`;
            window.location.href = urlWithConferenceId;
        }
    }, [conference, otherServer, crossServerEvent, dispatch]);

    const onHandleDecline = React.useCallback(() => {
        if (conference && !crossServerEvent) {
            dispatch(declineCall(conference.channel_id));
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    }, [conference, crossServerEvent, dispatch]);

    const onHandleCancel = React.useCallback(() => {
        if (conference) {
            dispatch(cancelCall(conference.channel_id));
        }
    }, [dispatch, conference]);

    const registrants = conference?.registrants;
    const callerStatus = caller && registrants?.[caller.id]?.status;

    const isValidCaller = caller && registrants && caller.id in registrants;
    const isApprovedOrDenied = callerStatus === 'approved' || callerStatus === 'denied';

    if (isValidCaller && isApprovedOrDenied) {
        dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
    }

    useEffect(() => {
        window.addEventListener('offline', onHandleDecline);
        return () => window.removeEventListener('offline', onHandleDecline);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchParticipants = async () => {
            if (crossServerEvent) {
                const userIds = crossServerEvent.data.participants;
                try {
                    const data = await getRemoteUsers(otherServerName, userIds);
                    const filteredData = data.filter((participant) => participant.nickname !== user.nickname);
                    if (!signal.aborted) {
                        setOtherServerParticipants(filteredData);
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error fetching participants:', error);
                }
            }
        };

        fetchParticipants();

        return () => {
            abortController.abort();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        window.addEventListener('offline', onHandleDecline);
        return () => window.removeEventListener('offline', onHandleDecline);
    }, [onHandleDecline]);

    useEffect(() => {
        ring(isCallerCurrentUser ? 'OutgoingRing' : 'Ring');

        return () => {
            stopRing();
        };
    }, [isCallerCurrentUser]);

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
        if (crossServerEvent) {
            return (
                <>
                    <div className='call-modal__calling-user'>
                        <span>
                            {otherServerParticipants && getUsersNicknames(otherServerParticipants)}
                        </span>
                    </div>
                    <div className='call-modal__other-server-name'>
                        {otherServerName && `${otherServerName}`}
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
        }
        switch (channel?.type) {
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

    // This scenario can occur if the conference ended while the application was offline,
    // causing this modal to remain visible. Upon websocket reconnection, the conference
    // state is updated asynchronously, which may lead to a brief instant of undefined conference.
    if (!conference && !crossServerEvent) {
        return null;
    }

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
                    <KMeetAvatars
                        otherServerParticipants={otherServerParticipants}
                        channelId={channel?.id}
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
