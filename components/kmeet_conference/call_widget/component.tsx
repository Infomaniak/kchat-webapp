// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-lines */
import React, {CSSProperties} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import moment from 'moment-timezone';

import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import {Team} from 'mattermost-redux/types/teams';

import {Channel} from 'mattermost-redux/types/channels';

import {UserProfile} from 'mattermost-redux/types/users';

import {getUserDisplayName, isPublicChannel} from 'components/kmeet_conference/utils';

import MutedIcon from 'components/widgets/icons/muted_icon';
import UnmutedIcon from 'components/widgets/icons/unmuted_icon';
import LeaveCallIcon from 'components/widgets/icons/leave_call_icon';
import ParticipantsIcon from 'components/widgets/icons/participants';
import CompassIcon from 'components/widgets/icons/compassIcon';
import PopOutIcon from 'components/widgets/icons/popout';
import ExpandIcon from 'components/widgets/icons/expand';
import RaisedHandIcon from 'components/widgets/icons/raised_hand';
import CallUsersIcon from 'components/widgets/icons/call_users_icon';
import LeaveConvIcon from 'components/widgets/icons/leave_conf_icon';

// import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {UserState} from 'reducers/views/calls';

import './component.scss';
import Avatar from 'components/widgets/users/avatar';

import GlobeIcon from 'components/widgets/icons/globe_icon';

import {isDesktopApp} from 'utils/user_agent';
import ChannelConvIcon from 'components/widgets/icons/channel_conv_icon';

interface Props {
    theme: any;
    currentUserID: string;
    channel: Channel;
    team: Team;
    channelURL: string;
    profiles: UserProfile[];
    profilesMap: IDMappedObjects<UserProfile>;
    pictures: string[];
    picturesMap: {
        [key: string]: string;
    };
    statuses: {
        [key: string]: UserState;
    };
    callStartAt: number;
    callID: string;
    screenSharingID: string;
    show: boolean;
    showExpandedView: () => void;
    hideExpandedView: () => void;
    showScreenSourceModal: () => void;
    disconnect: () => void;
    updateAudioStatus: () => void;
}

interface DraggingState {
    dragging: boolean;
    x: number;
    y: number;
    initX: number;
    initY: number;
    offX: number;
    offY: number;
}

interface State {
    showMenu: boolean;
    showParticipantsList: boolean;
    screenSharingID?: string;
    intervalID?: NodeJS.Timer;
    screenStream?: any;
    currentAudioInputDevice?: any;
    currentAudioOutputDevice?: any;
    devices?: any;
    showAudioInputDevicesMenu?: boolean;
    showAudioOutputDevicesMenu?: boolean;
    dragging: DraggingState;
    expandedViewWindow: Window | null;
    showUsersJoined: string[];
    audioMuted: boolean;
    expanded: boolean;
}

export default class CallWidget extends React.PureComponent<Props, State> {
    private node: React.RefObject<HTMLDivElement>;
    private _ref: React.RefObject<HTMLDivElement>;
    api: any;
    client: any;
    participants: any;

    private style = {
        main: {
            position: 'fixed',
            background: 'var(--center-channel-bg)',
            borderRadius: '8px',
            display: 'flex',
            bottom: '12px',
            left: '12px',
            lineHeight: '16px',
            zIndex: '1000',
            border: '1px solid #333',
            userSelect: 'none',
            color: 'white',
            padding: '16px',
        },
        topBar: {
            background: 'var(--center-channel-bg)',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            marginBottom: '20px',
            cursor: 'move',
        },
        bottomBar: {
            padding: '6px 0 0',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center',
        },
        bottomBarLeft: {
            display: 'flex',
            marginRight: 'auto',
        },
        mutedButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
        },
        unmutedButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
            background: 'rgba(61, 184, 135, 0.24)',
            borderRadius: '4px',
            color: 'rgba(61, 184, 135, 1)',
        },
        disconnectButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'color: rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            margin: '0 8px',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: '#D24B4E',
        },
        status: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
        },
        callInfo: {
            display: 'flex',
            fontSize: '11px',
            color: 'white',
        },
        profiles: {
            display: 'flex',
            marginRight: '8px',
        },
        menuButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '14px',
            width: '24px',
            height: '24px',
        },
        menu: {
            position: 'absolute',
            background: 'white',
            color: 'white',
        },
        screenSharingPanel: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            minWidth: 'revert',
            maxWidth: 'revert',
        },
        leaveCallButton: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            height: '28px',
            borderRadius: '4px',
            background: '#D71E04',
        },
        dotsMenu: {
            position: 'relative',
            width: '100%',
            minWidth: 'revert',
            maxWidth: 'revert',
        },
        audioInputsOutputsMenu: {
            left: 'calc(100% + 4px)',
            top: 'auto',
        },
        expandButton: {
            position: 'absolute',
            right: '8px',
            top: '8px',
            margin: 0,
        },
    };

    constructor(props: Props) {
        super(props);
        this.client = window;
        this.state = {
            showMenu: false,
            showParticipantsList: false,
            dragging: {
                dragging: false,
                x: 0,
                y: 0,
                initX: 0,
                initY: 0,
                offX: 0,
                offY: 0,
            },
            expandedViewWindow: null,
            showUsersJoined: [],
            audioMuted: true,
            expanded: false,
        };
        this._ref = React.createRef();
        this.node = React.createRef();
    }

    public componentDidMount() {
        document.addEventListener('mouseup', this.onMouseUp, false);
        document.addEventListener('click', this.closeOnBlur, true);
        document.addEventListener('keyup', this.keyboardClose, true);
        this.client.audioMuteStatusChanged = (data) => {
            console.log('updated audio', data);
            this.props.updateAudioStatus(this.props.callID, data.muted);

            // this.setState({ audioMuted: data.muted })
        };
        this.client.readyToClose = () => this.props.disconnect();

        // This is needed to force a re-render to periodically update
        // the start time.
        const id = setInterval(() => this.forceUpdate(), 1000);
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            intervalID: id,
            showUsersJoined: [this.props.currentUserID],
        });

        setTimeout(() => {
            this.setState({
                showUsersJoined: this.state.showUsersJoined.filter((userID) => userID !== this.props.currentUserID),
            });
        }, 5000);
    }

    public componentWillUnmount() {
        document.removeEventListener('mouseup', this.onMouseUp, false);
        document.removeEventListener('click', this.closeOnBlur, true);
        document.removeEventListener('keyup', this.keyboardClose, true);
        if (this.state.intervalID) {
            clearInterval(this.state.intervalID);
        }
    }

    private keyboardClose = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            this.setState({showMenu: false});
        }
    }

    private closeOnBlur = (e: Event) => {
        if (this.node && this.node.current && e.target && this.node.current.contains(e.target as Node)) {
            return;
        }
        this.setState({showMenu: false});
    }

    onCallClosed() {
        this.setState({
            showMenu: false,
            showParticipantsList: false,
            currentAudioInputDevice: null,
            dragging: {
                dragging: false,
                x: 0,
                y: 0,
                initX: 0,
                initY: 0,
                offX: 0,
                offY: 0,
            },
            expandedViewWindow: null,
        });

        // this.api.dispose();
    }

    onAudioStatusChange(muted: boolean) {
        console.log(muted);

        // this.setState({
        //     audioMuted:
        // })
    }

    getCallDuration = () => {
        const dur = moment.utc(moment().diff(moment(this.props.callStartAt)));
        if (dur.hours() === 0) {
            return dur.format('mm:ss');
        }
        return dur.format('HH:mm:ss');
    }

    onShareScreenToggle = async () => {
        const state = {} as State;
        if (this.props.screenSharingID === this.props.currentUserID) {
            window.callsClient.unshareScreen();
            state.screenStream = null;
        } else if (!this.props.screenSharingID) {
            // if (window.desktop && compareSemVer(window.desktop.version, '5.1.0') >= 0) {
            //     this.props.showScreenSourceModal();
            // } else {
            //     const stream = await window.callsClient.shareScreen('', hasExperimentalFlag());
            //     state.screenStream = stream;
            // }
        }

        this.setState({
            ...state,
            showMenu: false,
        });
    }

    onMuteToggle = () => {
        this.client.executeCommand('toggleAudio');
    }

    onDisconnectClick = () => {
        // if (this.state.expandedViewWindow) {
        //     this.state.expandedViewWindow.close();
        // }

        if (this.client.executeCommand) {
            this.client.executeCommand('hangup');
        }

        // this.api.dispose();

        this.setState({
            showMenu: false,
            showParticipantsList: false,
            currentAudioInputDevice: null,
            dragging: {
                dragging: false,
                x: 0,
                y: 0,
                initX: 0,
                initY: 0,
                offX: 0,
                offY: 0,
            },
            expandedViewWindow: null,
        });
    }

    // onMenuClick = () => {
    //     this.setState({
    //         showMenu: !this.state.showMenu,
    //         devices: window.callsClient?.getAudioDevices(),
    //         showParticipantsList: false,
    //     });
    // }

    onParticipantsButtonClick = () => {
        this.setState({
            showParticipantsList: !this.state.showParticipantsList,
            showMenu: false,
        });
    }

    onAudioInputDeviceClick = (device: MediaDeviceInfo) => {
        if (device.deviceId !== this.state.currentAudioInputDevice?.deviceId) {
            window.callsClient.setAudioInputDevice(device);
        }
        this.setState({showAudioInputDevicesMenu: false, currentAudioInputDevice: device});
    }

    onAudioOutputDeviceClick = (device: MediaDeviceInfo) => {
        if (device.deviceId !== this.state.currentAudioOutputDevice?.deviceId) {
            window.callsClient.setAudioOutputDevice(device);
            const ps = [];
            for (const audioEl of this.state.audioEls) {
                // @ts-ignore - setSinkId is an experimental feature
                ps.push(audioEl.setSinkId(device.deviceId));
            }
            Promise.all(ps).then(() => {
                console.log('audio output has changed');
            }).catch((err) => {
                console.log(err);
            });
        }
        this.setState({showAudioOutputDevicesMenu: false, currentAudioOutputDevice: device});
    }

    renderScreenSharingPanel = () => {
        if (!this.props.screenSharingID) {
            return null;
        }

        // const isSharing = this.props.screenSharingID === this.props.currentUserID;

        // let profile;
        // if (!isSharing) {
        //     profile = this.props.profilesMap[this.props.screenSharingID];
        //     if (!profile) {
        //         return null;
        //     }
        // }

        return (
            <div
                className='Menu'
                style={{
                    display: 'flex',
                    position: 'relative',
                }}
            >
                <ul
                    className='Menu__content dropdown-menu'
                    style={this.style.screenSharingPanel as CSSProperties}
                >
                    <div
                        style={{position: 'relative', width: '80%', background: '#C4C4C4'}}
                    >
                        <button
                            className='cursor--pointer style--none'
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                padding: '8px 16px',
                                background: 'var(--button-bg)',
                                color: 'white',
                                borderRadius: '4px',
                                fontWeight: 600,
                                top: '50%',
                                left: '50%',
                                width: '112px',
                                transform: 'translate(-50%, -50%)',
                            }}
                            onClick={this.onExpandClick}
                        >

                            <PopOutIcon
                                fill='white'
                                width='16px'
                                height='16px'
                                style={{marginRight: '8px'}}
                            />
                            <span>{'Pop out'}</span>
                        </button>

                    </div>
                    <span style={{marginTop: '8px', color: '#333', fontSize: '12px', padding: '0 8px', textAlign: 'center'}}>{msg}</span>
                </ul>
            </div>
        );
    }

    renderSpeaking = () => {
        let speakingProfile;
        for (let i = 0; i < this.props.profiles.length; i++) {
            const profile = this.props.profiles[i];
            const status = this.props.statuses[profile.id];
            if (status?.voice) {
                speakingProfile = profile;
                break;
            }
        }
        return (
            <div style={{fontSize: '12px', display: 'flex', whiteSpace: 'pre'}}>
                <span style={{fontWeight: speakingProfile ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {speakingProfile ? getUserDisplayName(speakingProfile) : 'No one'}
                </span><span>{' is talking...'}</span>
            </div>
        );
    }

    renderParticipantsList = () => {
        if (!this.state.showParticipantsList) {
            return null;
        }

        const renderParticipants = () => {
            return Object.values(this.props.profiles).map((profile) => {
                const status = this.props.statuses[profile.id];
                let isMuted = true;
                let isSpeaking = false;
                let isHandRaised = false;
                if (status) {
                    isMuted = !status.unmuted;
                    isSpeaking = Boolean(status.voice);
                    isHandRaised = Boolean(status.raised_hand > 0);
                }

                const MuteIcon = isMuted ? MutedIcon : UnmutedIcon;

                return (
                    <li
                        className='MenuItem'
                        key={'participants_profile_' + profile.id}
                        style={{display: 'flex', padding: '1px 16px'}}
                    >
                        <Avatar
                            size='sm'
                            url={this.props.pictures[profile.id]}
                            style={{marginRight: '8px'}}
                        />

                        <span className='MenuItem__primary-text'>
                            {getUserDisplayName(profile)}
                            { profile.id === this.props.currentUserID &&
                            <span style={{color: '#333', whiteSpace: 'pre-wrap'}}>{' (you)'}</span>
                            }
                        </span>

                        <span
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 'auto',
                                gap: '4px',
                            }}
                        >
                            { isHandRaised &&
                            <RaisedHandIcon
                                fill={'rgba(255, 188, 66, 1)'}
                                style={{width: '14px', height: '14px'}}
                            />
                            }

                            <MuteIcon
                                fill={isMuted ? '#C4C4C4' : '#3DB887'}
                                style={{width: '14px', height: '14px'}}
                                stroke={isMuted ? '#C4C4C4' : '#3DB887'}
                            />

                        </span>
                    </li>
                );
            });
        };

        return (
            <div
                className='Menu'
                style={{}}
            >
                <ul
                    className='Menu__content dropdown-menu'
                    style={{width: '100%', minWidth: 'revert', maxWidth: 'revert', maxHeight: '188px', overflow: 'auto', position: 'relative'}}
                >
                    <li
                        className='MenuHeader'
                        style={{paddingBottom: '4px', color: '#333'}}
                    >
                        {'Participants'}
                    </li>
                    { renderParticipants() }
                </ul>
            </div>
        );
    }

    renderAudioDevicesMenu = (deviceType: string) => {
        if (deviceType === 'input' && !this.state.showAudioInputDevicesMenu) {
            return null;
        }

        if (deviceType === 'output' && !this.state.showAudioOutputDevicesMenu) {
            return null;
        }

        const devices = deviceType === 'input' ? this.state.devices.inputs : this.state.devices.outputs;
        const currentDevice = deviceType === 'input' ? this.state.currentAudioInputDevice : this.state.currentAudioOutputDevice;

        return (
            <div className='Menu'>
                <ul
                    id={`calls-widget-audio-${deviceType}s-menu`}
                    className='Menu__content dropdown-menu'
                    style={this.style.audioInputsOutputsMenu}
                >
                    {
                        devices.map((device: any, idx: number) => {
                            return (
                                <li
                                    className='MenuItem'
                                    key={`audio-${deviceType}-device-${idx}`}
                                >
                                    <button
                                        className='style--none'
                                        style={{background: device.deviceId === currentDevice?.deviceId ? 'rgba(28, 88, 217, 0.12)' : ''}}
                                        onClick={() => (deviceType === 'input' ? this.onAudioInputDeviceClick(device) : this.onAudioOutputDeviceClick(device))}
                                    >
                                        <span style={{color: '#333', fontSize: '12px', width: '100%'}}>{device.label}</span>
                                    </button>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }

    renderProfiles = () => {
        let speakingPictureURL;
        this.props.profiles.forEach((p) => {
            const profile = p;
            const status = this.props.statuses[profile.id];
            if (status?.voice) {
                speakingPictureURL = this.props.pictures[profile.id];
            }
        });

        return (
            <div
                style={{position: 'relative', display: 'flex', height: 'auto', alignItems: 'center'}}
            >

                {

                    speakingPictureURL &&
                    <Avatar
                        size='md'
                        url={speakingPictureURL}
                    />
                }

                {
                    !speakingPictureURL &&
                    <Avatar
                        size='md'
                        icon='account-outline'
                        style={{
                            background: 'lightblue',
                            color: '#333',
                            fontSize: '14px',
                        }}
                    />
                }

            </div>
        );
    }

    renderNotificationBar = () => {
        if (!this.props.currentUserID) {
            return null;
        }

        const isMuted = this.state.audioMuted;

        const MuteIcon = isMuted ? MutedIcon : UnmutedIcon;
        const onJoinSelf = (
            <React.Fragment>
                <span>{`You are ${isMuted ? 'muted' : 'unmuted'}. Click `}</span>
                <MuteIcon
                    style={{width: '11px', height: '11px', fill: isMuted ? '#333' : '#333'}}
                    stroke={isMuted ? 'rgba(210, 75, 78, 1)' : '#3DB887'}
                />
                <span>{` to ${isMuted ? 'unmute' : 'mute'}.`}</span>
            </React.Fragment>
        );

        const notificationContent = onJoinSelf;

        const joinedUsers = this.state.showUsersJoined.map((userID, idx) => {
            if (userID === this.props.currentUserID) {
                return null;
            }

            const profile = this.props.profiles[userID];
            const picture = this.props.pictures[userID];
            if (!profile) {
                return null;
            }

            return (
                <div
                    className='calls-notification-bar calls-slide-top'
                    style={{justifyContent: 'flex-start'}}
                    key={profile.id}
                >
                    <Avatar
                        size='sm'
                        url={picture}
                        style={{margin: '0 8px'}}
                    />
                    {`${getUserDisplayName(profile)} has joined the call.`}
                </div>
            );
        });

        return (
            <React.Fragment>
                <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
                    { joinedUsers }
                </div>
                { this.state.showUsersJoined.includes(this.props.currentUserID) &&
                <div className='calls-notification-bar calls-slide-top'>
                    {notificationContent}
                </div>
                }
            </React.Fragment>
        );
    }

    onMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
        document.addEventListener('mousemove', this.onMouseMove, false);
        const target = ev.target as HTMLElement;
        this.setState({
            dragging: {
                ...this.state.dragging,
                dragging: true,
                initX: ev.clientX - this.state.dragging.offX,
                initY: ev.clientY - this.state.dragging.offY,
            },
        });
    }

    onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener('mousemove', this.onMouseMove, false);
        const target = ev.target as HTMLElement;
        this.setState({
            dragging: {
                ...this.state.dragging,
                dragging: false,
                initX: this.state.dragging.x,
                initY: this.state.dragging.y,
            },
        });
    }

    onMouseMove = (ev: MouseEvent) => {
        if (this.state.dragging.dragging && this.node && this.node.current) {
            ev.preventDefault();

            let x = ev.clientX - this.state.dragging.initX;
            let y = ev.clientY - this.state.dragging.initY;

            const rect = this.node.current.getBoundingClientRect();
            const bodyWidth = document.body.clientWidth;
            const bodyHeight = document.body.clientHeight;

            const maxDiffY = bodyHeight - Math.abs(bodyHeight - rect.y);
            const diffY = Math.abs(this.state.dragging.y - y);
            if (diffY > maxDiffY && y < this.state.dragging.y) {
                y = this.state.dragging.y - maxDiffY;
            } else if (rect.bottom + diffY > bodyHeight && y > this.state.dragging.y) {
                y = this.state.dragging.y + (bodyHeight - rect.bottom);
            }

            const maxDiffX = bodyWidth - Math.abs(bodyWidth - rect.x);
            const diffX = Math.abs(this.state.dragging.x - x);
            if (diffX > maxDiffX && x < this.state.dragging.x) {
                x = this.state.dragging.x - maxDiffX;
            } else if (rect.right + diffX > bodyWidth && x > this.state.dragging.x) {
                x = this.state.dragging.x + (bodyWidth - rect.right);
            }

            this.setState({
                dragging: {
                    ...this.state.dragging,
                    x,
                    y,
                    offX: x,
                    offY: y,
                },
            });
            this.node.current.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        }
    }

    onExpandClick = () => {
        if (!isDesktopApp() && window.callWindow) {
            window.callWindow.focus();
        }

        // if (this.state.expandedViewWindow && !this.state.expandedViewWindow.closed) {
        //     this.state.expandedViewWindow.focus();
        //     return;
        // }

        // // TODO: remove this as soon as we support opening a window from desktop app.
        if (this.props.show) {
            this.props.hideExpandedView();
            this.setState({
                expanded: false,
            });

            return;
        }

        this.props.showExpandedView();

        this.setState({
            expanded: true,
        });

        // } else {
        //     const expandedViewWindow = window.open(
        //         `/${this.props.team.name}/${isDMChannel(this.props.channel) ? 'messages' : 'channels'}/${this.props.channel.name}/call`,
        //         'ExpandedView',
        //         'resizable=yes',
        //     );

        this.setState({
            expanded: true,
        });

        // }
        // browserHistory.push(`/${this.props.team.name}/${isDMChannel(this.props.channel) ? 'messages' : 'channels'}/${this.props.channel.name}/call`);
    }

    // onRaiseHandToggle = () => {
    //     if (!window.callsClient) {
    //         return;
    //     }
    //     if (window.callsClient.isHandRaised) {
    //         window.callsClient.unraiseHand();
    //     } else {
    //         window.callsClient.raiseHand();
    //     }
    // }

    onChannelLinkClick = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
        window.postMessage({type: 'browser-history-push-return', message: {pathName: this.props.channelURL}}, window.origin);
    }

    renderChannelName = (hasTeamSidebar: boolean) => {
        return (
            <React.Fragment>
                <div style={{margin: '0 2px 0 4px'}}>{'•'}</div>

                <a
                    href={this.props.channelURL}
                    onClick={this.onChannelLinkClick}
                    className='calls-channel-link'
                >
                    {isPublicChannel(this.props.channel) ? <CompassIcon icon='globe'/> : <CompassIcon icon='lock'/>}
                    <span
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: hasTeamSidebar ? '24ch' : '14ch',
                        }}
                    >
                        {this.props.channel.display_name}
                    </span>
                </a>
            </React.Fragment>
        );
    }

    render() {
        if (!this.props.channel) {
            return null;
        }

        const MuteIcon = this.state.audioMuted ? MutedIcon : UnmutedIcon;
        const muteTooltipText = this.state.audioMuted ? 'Click to unmute' : 'Click to mute';

        const hasTeamSidebar = Boolean(document.querySelector('.team-sidebar'));
        const mainWidth = hasTeamSidebar ? '280px' : '216px';

        const ShowIcon = window.desktop ? ExpandIcon : PopOutIcon;

        // const HandIcon = window.callsClient.isHandRaised ? UnraisedHandIcon : RaisedHandIcon;
        // const handTooltipText = window.callsClient.isHandRaised ? 'Click to lower hand' : 'Click to raise hand';

        // const iframe = <IFrame/>;

        // if (this.state.expanded) {
        //     return (
        //         <RenderInWindow>
        //             <IFrame/>
        //         </RenderInWindow>
        //     );
        // }

        return (
            <React.Fragment>
                <div
                    id='calls-widget'
                    style={{
                        ...this.style.main as CSSProperties,
                        width: mainWidth,
                    }}
                    ref={this.node}
                >
                    <div style={this.style.status as CSSProperties}>
                        <div style={{position: 'absolute', bottom: 'calc(100% + 4px)', width: '100%'}}>
                            {this.renderNotificationBar()}
                            {this.renderParticipantsList()}
                        </div>

                        <div
                            style={this.style.topBar}
                            onMouseDown={this.onMouseDown}
                        >
                            <a
                                href={this.props.channelURL}
                                onClick={this.onChannelLinkClick}
                                className='calls-channel-link'
                            >
                                {isPublicChannel(this.props.channel) ? <ChannelConvIcon fill='#9F9F9F'/> : <ParticipantsIcon fill='#9F9F9F'/>}
                                <span
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: hasTeamSidebar ? '24ch' : '14ch',
                                        marginLeft: '5px',
                                        fontWeight: 400,
                                        color: 'black',
                                        fontSize: '14px',
                                    }}
                                >
                                    {this.props.channel.display_name}
                                </span>
                            </a>
                            <button
                                id='calls-widget-expand-button'
                                className='style--none button-controls button-controls--wide'
                                style={this.style.expandButton as CSSProperties}
                                onClick={this.onExpandClick}
                            >
                                <ShowIcon
                                    style={{width: '14px', height: '14px'}}
                                    fill='white'
                                />
                            </button>

                            {/* <div style={this.style.profiles}>
                            {this.renderProfiles()}
                        </div>
                        <div style={{width: '85%'}}>
                            {this.renderSpeaking()}
                            <div style={this.style.callInfo}>
                                <div style={{fontWeight: 600}}>{this.getCallDuration()}</div>
                                {(isPublicChannel(this.props.channel) || isPrivateChannel(this.props.channel)) && this.renderChannelName(hasTeamSidebar)}
                            </div>
                        </div> */}
                        </div>

                        <div
                            className='calls-widget-bottom-bar'
                            style={this.style.bottomBar}
                        >
                            <div
                                className='calls-widget-bottom-bar-left'
                                style={this.style.bottomBarLeft}
                            >
                                <OverlayTrigger
                                    key='mute'
                                    placement='top'
                                    overlay={
                                        <Tooltip id='tooltip-mute'>
                                            {muteTooltipText}
                                        </Tooltip>
                                    }
                                >
                                    <button
                                        id='voice-mute-unmute'
                                        className='cursor--pointer style--none button-controls'
                                        style={this.state.audioMuted ? this.style.mutedButton : this.style.unmutedButton}
                                        onClick={this.onMuteToggle}
                                    >
                                        <MuteIcon
                                            style={{width: '16px', height: '16px', fill: this.state.audioMuted ? '#9F9F9F' : '#0098FF'}}
                                            // stroke={this.state.audioMuted ? 'rgba(210, 75, 78, 1)' : ''}
                                        />
                                    </button>
                                </OverlayTrigger>
                            </div>
                            {/* <button
                            id='calls-widget-toggle-menu-button'
                            className='cursor--pointer style--none button-controls'
                            style={this.style.menuButton}
                            onClick={this.onMenuClick}
                        >
                            <HorizontalDotsIcon
                                style={{width: '16px', height: '16px'}}
                            />
                        </button> */}

                            <OverlayTrigger
                                key='participants'
                                placement='top'
                                overlay={
                                    <Tooltip id='tooltip-mute'>
                                        {this.state.showParticipantsList ? 'Hide participants' : 'Show participants'}
                                    </Tooltip>
                                }
                            >
                                <button
                                    className='style--none button-controls button-controls--wide'
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: this.state.showParticipantsList ? 'rgba(28, 88, 217, 1)' : '',
                                        background: this.state.showParticipantsList ? 'rgba(28, 88, 217, 0.12)' : '',
                                    }}
                                    onClick={this.onParticipantsButtonClick}
                                >
                                    {/* <ParticipantsIcon
                                        fill='white'
                                        style={{width: '16px', height: '16px', marginRight: '4px'}}
                                    /> */}
                                    <CallUsersIcon
                                        style={{marginRight: '4px'}}
                                    />
                                    <span
                                        style={{fontWeight: 600, color: 'black'}}
                                    >{Object.keys(this.props.profiles).length}</span>
                                </button>
                            </OverlayTrigger>

                            <OverlayTrigger
                                key='leave'
                                placement='top'
                                overlay={
                                    <Tooltip id='tooltip-leave'>
                                        {'Click to leave call'}
                                    </Tooltip>
                                }
                            >

                                <button
                                    id='calls-widget-leave-button'
                                    className='style--none button-controls button-controls--wide'
                                    style={this.style.leaveCallButton}
                                    onClick={this.onDisconnectClick}
                                >
                                    <LeaveConvIcon
                                        fill='#fff'
                                        style={{width: '16px', height: '6px'}}
                                    />
                                </button>
                            </OverlayTrigger>

                            {/* { !isDMChannel(this.props.channel) &&
                        <OverlayTrigger
                            key='hand'
                            placement='top'
                            overlay={
                                <Tooltip id='tooltip-hand'>
                                    {handTooltipText}
                                </Tooltip>import {UserState
                            }
                        >
                            <button
                                className='cursor--pointer style--none button-controls'
                                onClick={this.onRaiseHandToggle}
                                style={{background: window.callsClient.isHandRaised ? 'rgba(255, 188, 66, 0.16)' : ''}}
                            >
                                <HandIcon
                                    style={{width: '16px', height: '16px', fill: window.callsClient.isHandRaised ? 'rgba(255, 188, 66, 1)' : ''}}
                                />
                            </button>

                        </OverlayTrigger>
                        } */}

                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
