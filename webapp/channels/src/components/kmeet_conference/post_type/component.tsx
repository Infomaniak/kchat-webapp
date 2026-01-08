// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import type {FC} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import type {MessageDescriptor} from 'react-intl';
import {defineMessages, FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import type {Post} from '@mattermost/types/posts';

import {putChannelActiveConf} from 'actions/calls';

import KMeetIcon from 'components/widgets/icons/kmeet_icon';

import {isDesktopExtendedCallSupported} from 'utils/calls_utils';
import {isDesktopApp} from 'utils/user_agent';

import type {Conference} from 'types/conference';

import * as Sc from './styled';

import Avatars from '../avatars';

interface Props {
    post: Post;
    conference?: Conference;
    isDialingEnabled: boolean;
    hasConferenceStarted?: boolean;
    startOrJoinCallInChannelV2: (channelID: string) => void;
    joinCall: (channelID: string) => void;
}

type Status = 'M'|'O'|'E'|'D'|'S' | undefined

const messages: Record<string, MessageDescriptor> = defineMessages({
    O: {
        id: 'kmeet.calls.started',
        defaultMessage: 'kMeet meeting started',
    },
    M: {
        id: 'kmeet.calls.called',
        defaultMessage: 'Missed call',
    },
    E: {
        id: 'kmeet.calls.ended.title',
        defaultMessage: 'Call ended',
    },
    D: {
        id: 'kmeet.calls.in_progress',
        defaultMessage: 'Call in progress',
    },
    S: {
        id: 'kmeet.calls.declined',
        defaultMessage: 'Call declined',
    },
});

const PostType: FC<Props> = ({post, conference, isDialingEnabled, startOrJoinCallInChannelV2, joinCall}) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const meetingUrl = useMemo(() => conference?.url ?? post.props.url, [conference, post]);
    const [now, setNow] = useState(Date.now());

    const onJoinCallClick = () => {
        joinCall(post.channel_id);
    };

    const onStartOrJoinCall = () => {
        startOrJoinCallInChannelV2(post.channel_id);
    };

    moment.locale(String(intl.locale));

    useEffect(() => {
        if (!post.props.start_at) {
            return undefined;
        }

        // This useEffect handles the automatic refresh of the elapsed time display since the call started (start_at).
        // It forces a re-render every minute if the call started less than an hour ago, then every hour after that,
        // in order to optimize performance while keeping the display up to date.
        const ONE_MINUTE = 60_000;
        const ONE_HOUR = 60 * ONE_MINUTE;

        const getInterval = () => {
            if (post.props.start_at && (Date.now() - post.props.start_at > ONE_HOUR)) {
                return ONE_HOUR;
            }
            return ONE_MINUTE;
        };
        let intervalId: NodeJS.Timeout;
        let currentInterval = getInterval();

        const tick = () => {
            setNow(Date.now());

            const newInterval = getInterval();
            if (newInterval !== currentInterval) {
                clearInterval(intervalId);
                currentInterval = newInterval;
                intervalId = setInterval(tick, currentInterval);
            }
        };

        intervalId = setInterval(tick, currentInterval);
        return () => clearInterval(intervalId);
    }, [post.props.start_at]);

    useEffect(() => {
        if (post.props.conference_id && meetingUrl && post.channel_id) {
            dispatch(putChannelActiveConf(post.channel_id, post.props.conference_id, meetingUrl));
        }
    }, [dispatch, post.props.conference_id, meetingUrl, post.channel_id]);

    const defineStatus = (): Status => {
        switch (post.props.status) {
        case 'calling':
            return 'O';
        case 'joined':
            return 'D';
        case 'ended':
            return 'E';
        case 'missed':
            return 'M';
        case 'declined':
            return 'S';
        default:
            return 'E';
        }
    };

    const renderCallStatus = (status: Status = 'O') => {
        if (!isDialingEnabled) {
            return (
                <Sc.MessageWrapper>
                    <Sc.Message>
                        <FormattedMessage
                            id='kmeet.calls.started'
                            defaultMessage='kMeet meeting started'
                        />
                    </Sc.Message>
                    <Sc.SubMessage>{subMessage}</Sc.SubMessage>
                </Sc.MessageWrapper>
            );
        }

        return (
            <Sc.MessageWrapper>
                <Sc.Message>
                    <FormattedMessage
                        {...messages[status]}
                    />
                </Sc.Message>
                <Sc.SubMessage>{subMessage}</Sc.SubMessage>
            </Sc.MessageWrapper>
        );
    };

    const renderButton = (status: Status) => {
        if (isDialingEnabled) {
            if (conference && status === 'O') {
                return (
                    <Sc.JoinButton onClick={onJoinCallClick}>
                        <Sc.ButtonText>
                            <FormattedMessage
                                id='kmeet.calls.open'
                                defaultMessage='Join'
                            />
                        </Sc.ButtonText>
                    </Sc.JoinButton>
                );
            }
            if (status === 'M') {
                return (
                    <Sc.JoinButton onClick={onStartOrJoinCall}>
                        <Sc.ButtonText>
                            <FormattedMessage
                                id='kmeet.calls.callback'
                                defaultMessage='Callback'
                            />
                        </Sc.ButtonText>
                    </Sc.JoinButton>
                );
            }
        }

        return conference ? (
            <Sc.JoinButton onClick={onJoinCallClick}>
                <Sc.ButtonText>
                    <FormattedMessage
                        id='kmeet.calls.open'
                        defaultMessage='Join'
                    />
                </Sc.ButtonText>
            </Sc.JoinButton>
        ) : null;
    };

    const renderAvatars = () => {
        if (!conference) {
            return <></>;
        }

        return (
            <Avatars
                channelId={post.channel_id}
                displayProfileStatus={true}
                size='lg'
            />
        );
    };

    const subMessage = post.props.end_at ? (
        <Sc.Duration>
            <FormattedMessage
                id='kmeet.calls.ended'
                defaultMessage='Finished at {time}'
                values={{
                    time: moment(post.props.end_at).format('LT'),
                }}
            />
        </Sc.Duration>
    ) : (
        <Sc.Duration>
            {moment(post.props.start_at as number).from(now)}
        </Sc.Duration>
    );

    const status = defineStatus();

    return (
        <Sc.Main data-testid={'call-thread'}>
            <Sc.Left>
                <Sc.CallIndicator ended={Boolean(post.props.end_at)}>
                    <KMeetIcon style={{width: '100%', height: '100%'}}/>
                </Sc.CallIndicator>
                {renderCallStatus(status)}
            </Sc.Left>
            <Sc.Right>
                {(!isDesktopApp() || isDesktopExtendedCallSupported()) && renderAvatars()}
                {renderButton(status)}
            </Sc.Right>
        </Sc.Main>
    );
};

export default PostType;
