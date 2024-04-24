// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import React, {useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';
import styled from 'styled-components';

import type {Post} from '@mattermost/types/posts';

import {joinCall, putChannelActiveConf} from 'actions/calls';

import KMeetIcon from 'components/widgets/icons/kmeet_icon';

interface Props {
    post: Post;
    connectedKmeetUrl: string;
    isDialingEnabled: boolean;
    startOrJoinCallInChannelV2: (channelID: string) => void;
}

const PostType = ({post, connectedKmeetUrl, isDialingEnabled, startOrJoinCallInChannelV2}: Props) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const meetingUrl = connectedKmeetUrl ?? post.props.url;

    const onJoinCallClick = () => {
        dispatch(joinCall(post.props.conference_id, meetingUrl));
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

    // M: missed
    // S: started
    // E: ended
    // D: declined
    type Status = 'M'|'O'|'E'|'D' | undefined
    let declinedUsernames: string[] = [];
    const defineStatus = (): Status => {
        const spec = post.props;
        const ended = Boolean(spec.end_at);

        if (spec.declined_usernames) {
            declinedUsernames = spec.declined_usernames;
            return 'D';
        }
        if (spec.in_call === true) {
            return 'M';
        }
        if (ended === true) {
            return 'E';
        }
        return 'O';
    };
    const renderCallStatus = (status: Status = 'O') => {
        if (!isDialingEnabled) {
            return (
                <MessageWrapper>
                    <Message>
                        <FormattedMessage
                            id='kmeet.calls.started'
                            defaultMessage='Réunion kMeet démarrée'
                        />
                    </Message>
                    <SubMessage>{subMessage}</SubMessage>
                </MessageWrapper>

            );
        }
        const text = {
            O: {id: 'kmeet.calls.started', defaultMessage: 'Appel démarré', values: {}},
            M: {id: 'kmeet.calls.called', defaultMessage: 'Appel manqué', values: {}},
            E: {id: 'kmeet.calls.ended.title', defaultMessage: 'Appel terminé', values: {}},
            D: {id: 'kmeet.calls.declined', defaultMessage: 'Appel refusé {usernames}', values: {usernames: declinedUsernames.toString()}},
        };
        return (
            <MessageWrapper>
                <Message>
                    <FormattedMessage
                        id={text[status].id}
                        defaultMessage={text[status].defaultMessage}
                        values={text[status].values}
                    />
                </Message>
                <SubMessage>{subMessage}</SubMessage>
            </MessageWrapper>
        );
    };

    const renderButton = (status: Status) => {
        if (isDialingEnabled) {
            if (meetingUrl && status === 'O') {
                return (
                    <JoinButton onClick={onJoinCallClick}>
                        <ButtonText>
                            <FormattedMessage
                                id='kmeet.calls.open'
                                defaultMessage='Rejoindre'
                            />
                        </ButtonText>
                    </JoinButton>
                );
            }
            if (status === 'M') {
                return (
                    <JoinButton onClick={onStartOrJoinCall}>
                        <ButtonText>
                            <FormattedMessage
                                id='kmeet.calls.callback'
                                defaultMessage='Rappeler'
                            />
                        </ButtonText>
                    </JoinButton>
                );
            }
        }

        return meetingUrl ? (
            <JoinButton onClick={onJoinCallClick}>
                <ButtonText>
                    <FormattedMessage
                        id='kmeet.calls.open'
                        defaultMessage='Ouvrir'
                    />
                </ButtonText>
            </JoinButton>
        ) : null;
    };

    const subMessage = post.props.end_at ? (
        <>
            <Duration>
                <FormattedMessage
                    id='kmeet.calls.ended'
                    defaultMessage='Terminée à {time}'
                    values={{
                        time: moment(post.props.end_at).format('LT'),
                    }}
                />
            </Duration>
        </>
    ) : (
        <Duration>
            {moment(post.props.start_at).fromNow()}
        </Duration>
    );
    const status: Status = defineStatus();
    return (
        <Main data-testid={'call-thread'}>

            <Left>
                <CallIndicator ended={Boolean(post.props.end_at)}>
                    <KMeetIcon style={{width: '100%', height: '100%'}}/>
                </CallIndicator>
                {renderCallStatus(status)}
            </Left>
            <Right>
                {renderButton(status)}
            </Right>

        </Main>
    );
};

const Main = styled.div`
    display: flex;
    align-items: center;
    width: min(600px, 100%);
    margin: 4px 0;
    padding: 16px;
    background: var(--center-channel-bg);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    box-shadow: 0px 4px 6px rgba(var(--center-channel-color-rgb), 0.12);
    color: var(--center-channel-color);
    border-radius: 4px;
`;

const Left = styled.div`
    display: flex;
    flex-grow: 10;
    overflow: hidden;
    white-space: nowrap;
`;

const Right = styled.div`
    display: flex;
    flex-grow: 1;
`;

const CallIndicator = styled.div<{ ended: boolean }>`
    border-radius: 4px;
    padding: 4px;
    width: 40px;
    height: 40px;
`;

const MessageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 12px;
    overflow: hidden;
`;

const Message = styled.span`
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SubMessage = styled.div`
    white-space: normal;
`;

const Profiles = styled.div`
    display: flex;
    align-items: center;
    margin-right: auto;
    img {
        max-width: 40px;
    }
`;

const Duration = styled.span`
    color: var(--center-channel-color);
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    cursor: pointer;
`;

const JoinButton = styled(Button)`
    color: var(--center-channel-bg);
    background: var(--button-bg);
`;

const LeaveButton = styled(Button)`
    color: var(--error-text);
    background: rgba(var(--error-text-color-rgb), 0.16);
`;

const ButtonText = styled.span`
    font-weight: 600;
    margin: 0 8px;
`;

export default PostType;
