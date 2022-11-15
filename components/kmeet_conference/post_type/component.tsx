// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import moment from 'moment-timezone';
import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';

import {Post} from 'mattermost-redux/types/posts';

import {FormattedMessage, useIntl} from 'react-intl';

import ActiveCallIcon from 'components/widgets/icons/active_call_icon';
import CallIcon from 'components/widgets/icons/call_icon';
import LeaveCallIcon from 'components/widgets/icons/leave_call_icon';
import ConnectedProfiles from '../connected_profiles';

import {isDesktopApp} from 'utils/user_agent';
import KMeetIcon from 'components/widgets/icons/kmeet_icon';

interface Props {
    post: Post;
    connectedID: string;
    hasCall: boolean;
    pictures: string[];
    profiles: UserProfile[];
    showSwitchCallModal: (targetID: string) => void;
    onJoinCall: (channelID: string) => void;
    leaveCallInChannel: (channelID: string, callId: string) => Promise<any>;

    // disconnect: (channedID: string) => void;
}

const PostType = ({post, connectedID, connectedUrl, hasCall, pictures, profiles, onJoinCall, leaveCallInChannel}: Props) => {
    const client = window;
    const intl = useIntl()
    // window.addEventListener('beforeunload', (e) => {
    //     window.postMessage(
    //         {
    //             type: 'window-will-unloaded',
    //         },
    //         window.origin,
    //     );
    //     if (hasCall && connectedID === post.props.conference_id && !post.props.end_at) {
    //         e.stopPropagation();
    //         e.preventDefault();
    //         leaveCallInChannel(post.channel_id, connectedID).then(() => {
    //             if (client.executeCommand) {
    //                 client.executeCommand('hangup');
    //             }
    //         });
    //     }
    // });

    const onJoinCallClick = () => {
        onJoinCall(post.channel_id);
    };

    const onLeaveButtonClick = () => {
        if (client.executeCommand) {
            client.executeCommand('hangup');
        }
    };
    moment.locale(String(intl.locale));

    const subMessage = post.props.end_at ? (
        <>
            {/*            <Duration>
                {`Ended at ${moment(post.props.end_at).format('h:mm A')}`}
            </Duration>
            <span style={{margin: '0 4px'}}>{'•'}</span>*/}
            <Duration>
                <FormattedMessage
                    id='kmeet.calls.ended'
                    defaultMessage='Terminée à {time}'
                    values={{
                        time: moment(post.props.end_at).format('LT'),
                    }}
                />
                {/*
                {`Lasted ${moment.duration(post.props.end_at - post.props.start_at).humanize(false)}`}
*/}
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
                        {/* {!post.props.end_at &&
                            <ActiveCallIcon
                                fill='var(--center-channel-bg)'
                                style={{width: '100%', height: '100%'}}
                            />
                        }
                        {post.props.end_at &&
                            <LeaveCallIcon
                                fill={'rgba(var(--center-channel-color-rgb), 0.56)'}
                                style={{width: '100%', height: '100%'}}
                            />
                        } */}
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
                    {/*{
                        hasCall &&
                        <Profiles>
                            <ConnectedProfiles
                                profiles={profiles}
                                pictures={pictures}
                                size={32}
                                fontSize={12}
                                border={true}
                                maxShowedProfiles={2}
                            />
                        </Profiles>
                    }*/}
                    {
                        hasCall && connectedUrl &&
                        <JoinButton onClick={onJoinCallClick}>
                            <ButtonText>
                                <FormattedMessage
                                    id='kmeet.calls.open'
                                    defaultMessage='Ouvrir'
                                />
                            </ButtonText>
                        </JoinButton>
                    }
                    {/*{
                        hasCall && connectedID && connectedID === post.props.conference_id &&
                        <LeaveButton onClick={onLeaveButtonClick}>
                            <LeaveCallIcon fill='var(--error-text)'/>
                            <ButtonText>{'Leave call'}</ButtonText>
                        </LeaveButton>
                    }*/}
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
