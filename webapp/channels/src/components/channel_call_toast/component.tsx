// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import ActiveCallIcon from './active_call_icon';
import ConnectedProfiles from './connected_profiles';

interface Props {
    currChannelID: string;
    connectedID?: string;
    hasCall: boolean;
    startAt?: number;
    pictures: string[];
    profiles: UserProfile[];
    startOrJoinCallInChannelV2: (channelID: string) => void;
}

interface State {
    hidden: boolean;
    connectedID?: string;
    intervalID?: NodeJS.Timer;
}

export default class ChannelCallToast extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: false,
        };
    }

    public componentDidMount() {
        // This is needed to force a re-render to periodically update
        // the start time.
        const id = setInterval(() => this.forceUpdate(), 60000);
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            intervalID: id,
        });
    }

    public componentWillUnmount() {
        if (this.state.intervalID) {
            clearInterval(this.state.intervalID);
        }
    }

    onJoinCallClick = async () => {
        const {startOrJoinCallInChannelV2} = this.props;

        if (this.props.connectedID) {
            return;
        }

        // window.postMessage({type: 'connectCall', channelID: this.props.currChannelID}, window.origin);

        startOrJoinCallInChannelV2(this.props.currChannelID);
    };

    onDismissClick = () => {
        this.setState({hidden: true});
    };

    render() {
        if (!this.props.hasCall || this.state.hidden) {
            return null;
        }

        return (
            <div
                id='calls-channel-toast'
                className='toast toast__visible'
                style={{backgroundColor: '#339970'}}
            >
                <div
                    className='toast__message toast__pointer'
                    onClick={this.onJoinCallClick}
                >
                    <div style={{position: 'absolute'}}>
                        <ActiveCallIcon
                            fill='white'
                            style={{margin: '0 4px'}}
                        />
                        <span style={{margin: '0 4px'}}>{'Join Call'}</span>
                        <span style={{opacity: '0.80', margin: '0 4px'}}>{`Started ${moment(this.props.startAt).fromNow()}`}</span>
                        <div/>
                    </div>
                </div>

                <div
                    style={
                        {position: 'absolute',

                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            right: '40px'}
                    }
                >
                    <ConnectedProfiles
                        profiles={this.props.profiles}
                        pictures={this.props.pictures}
                        border={false}
                        maxShowedProfiles={2}
                    />
                </div>

                <div
                    className='toast__dismiss'
                    onClick={this.onDismissClick}
                >
                    <span className='close-btn'>
                        <svg
                            width='24px'
                            height='24px'
                            viewBox='0 0 24 24'
                            role='img'
                            aria-label='Close Icon'
                        >
                            <path
                                fillRule='nonzero'
                                d='M18 7.209L16.791 6 12 10.791 7.209 6 6 7.209 10.791 12 6 16.791 7.209 18 12 13.209 16.791 18 18 16.791 13.209 12z'
                            />
                        </svg>
                    </span>
                </div>
            </div>
        );
    }
}

