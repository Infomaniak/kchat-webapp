// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import type {FC} from 'react';
import React, {useEffect, useMemo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
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

type Status = 'M'|'O'|'E'|'D' | undefined

const text = {
    O: {id: 'kmeet.calls.started', defaultMessage: 'Appel démarré', values: {}},
    M: {id: 'kmeet.calls.called', defaultMessage: 'Appel manqué', values: {}},
    E: {id: 'kmeet.calls.ended.title', defaultMessage: 'Appel terminé', values: {}},
    D: {id: 'kmeet.calls.in_progress', defaultMessage: 'Appel en cours', values: {}},
};

const PostType: FC<Props> = ({post, conference, isDialingEnabled, startOrJoinCallInChannelV2, joinCall, hasConferenceStarted}) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const meetingUrl = useMemo(() => conference?.url ?? post.props.url, [conference, post]);

    const onJoinCallClick = () => {
        joinCall(post.channel_id);
    };

    const onStartOrJoinCall = () => {
        startOrJoinCallInChannelV2(post.channel_id);
    };

    moment.locale(String(intl.locale));

    useEffect(() => {
        if (post.props.conference_id && meetingUrl && post.channel_id) {
            dispatch(putChannelActiveConf(post.channel_id, post.props.conference_id, meetingUrl));
        }
    }, [dispatch, post.props.conference_id, meetingUrl, post.channel_id]);

    const defineStatus = (): Status => {
        const spec = post.props;
        const ended = Boolean(spec.end_at);

        if (spec.in_call === true) {
            return 'M';
        }

        if (ended === true) {
            return 'E';
        }

        if (hasConferenceStarted) {
            return 'D';
        }

        return 'O';
    };

    const renderCallStatus = (status: Status = 'O') => {
        if (!isDialingEnabled) {
            return (
                <Sc.MessageWrapper>
                    <Sc.Message>
                        <FormattedMessage
                            id='kmeet.calls.started'
                            defaultMessage='Réunion kMeet démarrée'
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
                        id={text[status].id}
                        defaultMessage={text[status].defaultMessage}
                        values={text[status].values}
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
                                defaultMessage='Rejoindre'
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
                                defaultMessage='Rappeler'
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
                        defaultMessage='Ouvrir'
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
                defaultMessage='Terminée à {time}'
                values={{
                    time: moment(post.props.end_at).format('LT'),
                }}
            />
        </Sc.Duration>
    ) : (
        <Sc.Duration>
            {moment(post.props.start_at).fromNow()}
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
