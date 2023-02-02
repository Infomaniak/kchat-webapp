// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import moment from 'moment-timezone';
import styled from 'styled-components';

import {Post} from 'mattermost-redux/types/posts';

import {FormattedMessage, useIntl} from 'react-intl';

import KMeetIcon from 'components/widgets/icons/kmeet_icon';

interface Props {
    post: Post;
    connectedKmeetUrl: string;
}

const PostType = ({post, connectedKmeetUrl}: Props) => {
    const intl = useIntl();
    const onJoinCallClick = () => {
        const kmeetUrl = new URL(connectedKmeetUrl);
        window.open(kmeetUrl.href, '_blank', 'noopener');
    };

    moment.locale(String(intl.locale));

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

    return (
        <Main data-testid={'call-thread'}>
            <SubMain ended={Boolean(post.props.end_at)}>
                <Left>
                    <CallIndicator ended={Boolean(post.props.end_at)}>
                        <KMeetIcon style={{width: '100%', height: '100%'}}/>
                    </CallIndicator>
                    <MessageWrapper>
                        <Message>
                            <FormattedMessage
                                id='kmeet.calls.started'
                                defaultMessage='Réunion kMeet démarrée'
                            />
                        </Message>
                        <SubMessage>{subMessage}</SubMessage>
                    </MessageWrapper>
                </Left>
                <Right>
                    {
                        connectedKmeetUrl &&
                        <JoinButton onClick={onJoinCallClick}>
                            <ButtonText>
                                <FormattedMessage
                                    id='kmeet.calls.open'
                                    defaultMessage='Ouvrir'
                                />
                            </ButtonText>
                        </JoinButton>
                    }
                </Right>
            </SubMain>
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

const SubMain = styled.div<{ ended: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    flex-wrap: ${(props) => (props.ended ? 'nowrap' : 'wrap')};
    row-gap: 8px;
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
