/* eslint-disable max-lines */
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import type {CSSProperties} from 'react';
import React from 'react';

import type {UserProfile} from '@mattermost/types/users';

import type {Channel} from 'mattermost-redux/types/channels';
import type {IDMappedObjects} from 'mattermost-redux/types/utilities';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';
import {displayUsername} from 'mattermost-redux/utils/user_utils';

import type {UserState} from 'reducers/views/calls';

import {getUserDisplayName, isPublicChannel} from 'components/kmeet_conference/utils';
import CallMutedIcon from 'components/widgets/icons/call_micro_off';
import CallUnmutedIcon from 'components/widgets/icons/call_micro_on';
import CallUsersIcon from 'components/widgets/icons/call_users_icon';
import CameraOffIcon from 'components/widgets/icons/camera_off_icon';
import CameraOnIcon from 'components/widgets/icons/camera_on_icon';
import ChannelConvIcon from 'components/widgets/icons/channel_conv_icon';
import CompassIcon from 'components/widgets/icons/compassIcon';
import ExpandConvIcon from 'components/widgets/icons/expand_conv_icon';
import LeaveConvIcon from 'components/widgets/icons/leave_conf_icon';
import PopOutIcon from 'components/widgets/icons/popout';
import ScreenSharingIcon from 'components/widgets/icons/screen_sharing_icon';
import ShrinkConvIcon from 'components/widgets/icons/shrink_conv_icon';
import Avatar from 'components/widgets/users/avatar';
import Avatars from 'components/widgets/users/avatars/avatars';
import WithTooltip from 'components/with_tooltip';

import Constants from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {Team} from 'types/teams';

// import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import './component.scss';

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
    teammateNameDisplaySetting: string;
    getUser: (userId: string) => UserProfile;
    showExpandedView: () => void;
    hideExpandedView: () => void;
    showScreenSourceModal: () => void;
    disconnect: () => void;
    updateAudioStatus: (callID: string, muted: boolean) => void;
    updateCameraStatus: (callID: string, muted: boolean) => void;
    updateScreenSharingStatus: (callID: string, muted: boolean) => void;
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
    cameraOn: boolean;
    screenSharing: boolean;
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
        activeButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
            borderRadius: '4px',
            '&:hover': {
                background: 'rgba(var(--center-channel-color-rgb), 0.04)',
            },
        },
        unActiveButton: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '24px',
            borderRadius: '4px',
            '&:hover': {
                background: 'rgba(var(--center-channel-color-rgb), 0.04)',
            },
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
        callChannelDisplay: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '14ch',
            marginLeft: '5px',
            fontWeight: 400,
            color: 'var(--center-channel-color)',
            fontSize: '14px',
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
            audioMuted: false,
            expanded: false,
            cameraOn: false,
            screenSharing: false,
        };
        // eslint-disable-next-line no-underscore-dangle
        this._ref = React.createRef();
        this.node = React.createRef();
    }

    public componentDidMount() {
        document.addEventListener('mouseup', this.onMouseUp, false);
        document.addEventListener('click', this.closeOnBlur, true);
        document.addEventListener('keyup', this.keyboardClose, true);

        // Events from call window
        window.audioMuteStatusChanged = (data: { muted: boolean }) => {
            this.props.updateAudioStatus(this.props.callID, data.muted);

            this.setState({audioMuted: data.muted});
        };

        window.videoMuteStatusChanged = (data: { muted: boolean }) => {
            this.props.updateCameraStatus(this.props.callID, data.muted);

            this.setState({cameraOn: data.muted});
        };

        window.screenSharingStatusChanged = (data: { on: boolean }) => {
            this.props.updateScreenSharingStatus(this.props.callID, data.on);

            this.setState({screenSharing: data.on});
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
    };

    private closeOnBlur = (e: Event) => {
        if (this.node && this.node.current && e.target && this.node.current.contains(e.target as Node)) {
            return;
        }
        this.setState({showMenu: false});
    };

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
        // eslint-disable-next-line no-console
        console.log(muted);
    }

    getCallDuration = () => {
        const dur = moment.utc(moment().diff(moment(this.props.callStartAt)));
        if (dur.hours() === 0) {
            return dur.format('mm:ss');
        }
        return dur.format('HH:mm:ss');
    };

    onShareScreenToggle = async () => {
        const state = {} as State;
        if (this.props.screenSharingID === this.props.currentUserID) {
            window.callsClient.unshareScreen();
            state.screenStream = null;
        }

        this.setState({
            ...state,
            showMenu: false,
        });
    };

    onScreenshareToggle = () => {
        if (isDesktopApp()) {
            window.postMessage(
                {
                    type: 'call-command',
                    message: {
                        command: 'toggleShareScreen',
                    },
                },
                window.origin,
            );

            return;
        }

        this.client.executeCommand('toggleShareScreen');
    };

    onVideoToggle = () => {
        if (isDesktopApp()) {
            window.postMessage(
                {
                    type: 'call-command',
                    message: {
                        command: 'toggleVideo',
                    },
                },
                window.origin,
            );

            return;
        }

        this.client.executeCommand('toggleVideo');
    };

    onMuteToggle = () => {
        if (isDesktopApp()) {
            window.postMessage(
                {
                    type: 'call-command',
                    message: {
                        command: 'toggleAudio',
                    },
                },
                window.origin,
            );

            return;
        }
        this.client.executeCommand('toggleAudio');
    };

    onDisconnectClick = () => {
        if (isDesktopApp()) {
            window.postMessage(
                {
                    type: 'call-command',
                    message: {
                        command: 'hangup',
                    },
                },
                window.origin,
            );

            return;
        }

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
    };

    onParticipantsButtonClick = () => {
        this.setState({
            showParticipantsList: !this.state.showParticipantsList,
            showMenu: false,
        });
    };

    onAudioInputDeviceClick = (device: MediaDeviceInfo) => {
        if (device.deviceId !== this.state.currentAudioInputDevice?.deviceId) {
            window.callsClient.setAudioInputDevice(device);
        }
        this.setState({showAudioInputDevicesMenu: false, currentAudioInputDevice: device});
    };

    onAudioOutputDeviceClick = (device: MediaDeviceInfo) => {
        if (device.deviceId !== this.state.currentAudioOutputDevice?.deviceId) {
            window.callsClient.setAudioOutputDevice(device);
            const ps = [];
            for (const audioEl of this.state.audioEls) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - setSinkId is an experimental feature
                ps.push(audioEl.setSinkId(device.deviceId));
            }
            Promise.all(ps).then(() => {
                // eslint-disable-next-line no-console
                console.log('audio output has changed');
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.log(err);
            });
        }
        this.setState({showAudioOutputDevicesMenu: false, currentAudioOutputDevice: device});
    };

    renderScreenSharingPanel = () => {
        if (!this.props.screenSharingID) {
            return null;
        }

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
    };

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
    };

    renderParticipantsList = () => {
        if (!this.state.showParticipantsList) {
            return null;
        }

        const renderParticipants = () => {
            return Object.values(this.props.profiles).map((profile) => {
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
    };

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
    };

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
    };

    renderNotificationBar = () => {
        if (!this.props.currentUserID) {
            return null;
        }

        const isMuted = this.props.statuses[this.props.currentUserID] ? this.props.statuses[this.props.currentUserID].muted : true;

        const MuteIcon = isMuted ? CallMutedIcon : CallUnmutedIcon;
        const onJoinSelf = (
            <>
                <span>{`You are ${isMuted ? 'muted' : 'unmuted'}. Click `}</span>
                <MuteIcon
                    fill={isMuted ? '#9F9F9F' : '#0098FF'}
                    style={{width: '11px', height: '11px'}}
                />
                <span>{` to ${isMuted ? 'unmute' : 'mute'}.`}</span>
            </>
        );

        const notificationContent = onJoinSelf;

        const joinedUsers = this.state.showUsersJoined.map((userID) => {
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
            <>
                <div style={{display: 'flex', flexDirection: 'column-reverse'}}>
                    { joinedUsers }
                </div>
                { this.state.showUsersJoined.includes(this.props.currentUserID) &&
                    <div className='calls-notification-bar calls-slide-top'>
                        {notificationContent}
                    </div>
                }
            </>
        );
    };

    onMouseDown = (ev: React.MouseEvent<HTMLDivElement>) => {
        document.addEventListener('mousemove', this.onMouseMove, false);
        this.setState({
            dragging: {
                ...this.state.dragging,
                dragging: true,
                initX: ev.clientX - this.state.dragging.offX,
                initY: ev.clientY - this.state.dragging.offY,
            },
        });
    };

    onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove, false);
        this.setState({
            dragging: {
                ...this.state.dragging,
                dragging: false,
                initX: this.state.dragging.x,
                initY: this.state.dragging.y,
            },
        });
    };

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
    };

    onExpandClick = () => {
        if (!isDesktopApp() && window.callWindow) {
            window.callWindow.focus();
            return;
        }

        window.postMessage(
            {
                type: 'call-focus',
                message: {},
            },
            window.origin,
        );
    };

    onChannelLinkClick = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
    };

    renderChannelName = (hasTeamSidebar: boolean) => {
        return (
            <>
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
            </>
        );
    };

    render() {
        if (!this.props.channel) {
            return null;
        }

        const muted = this.props.statuses[this.props.currentUserID] ? this.props.statuses[this.props.currentUserID].muted : true;
        const video = this.props.statuses[this.props.currentUserID] ? this.props.statuses[this.props.currentUserID].video : false;
        const screen = this.props.statuses[this.props.currentUserID] ? this.props.statuses[this.props.currentUserID].screenshare : false;

        const MuteIcon = muted ? CallMutedIcon : CallUnmutedIcon;
        const muteTooltipText = muted ? 'Click to unmute' : 'Click to mute';

        const hasTeamSidebar = Boolean(document.querySelector('.team-sidebar'));
        const mainWidth = hasTeamSidebar ? '280px' : '216px';

        const ShowIcon = document && document.hasFocus() ? ExpandConvIcon : ShrinkConvIcon;
        const CameraIcon = video ? CameraOnIcon : CameraOffIcon;
        const cameraTooltipText = video ? 'Click to disable camera' : 'Click to enable camera';
        const screenSharingTooltipText = screen ? 'Click to share your screen' : 'Click to stop sharing your screen';

        let channelDisplayName = '';
        const membersMap: string[] = []; // If we have multiples users
        const callingUsers = Object.values(this.props.profiles).map((profile) => profile);

        switch (this.props.channel.type) {
        case Constants.DM_CHANNEL:

            if (callingUsers) {
                const callingDMUser = callingUsers.filter((user) => user.id !== this.props.currentUserID)[0];
                channelDisplayName = displayUsername(this.props.getUser(callingDMUser?.id), this.props.teammateNameDisplaySetting);
            }
            break;
        case Constants.GM_CHANNEL:
            for (const user of callingUsers) {
                if (user.id === this.props.currentUserID) {
                    continue;
                }
                const userDisplayName = displayUsername(user, this.props.teammateNameDisplaySetting);

                if (membersMap.indexOf(userDisplayName) === -1) {
                    membersMap.push(userDisplayName);
                }
            }
            channelDisplayName = membersMap.join(', ');
            break;
        default:
            channelDisplayName = this.props.channel.display_name;
            break;
        }
        if (channelDisplayName.length < 0 || channelDisplayName === localizeMessage({id: 'channel_loader.someone', defaultMessage: 'Someone'})) {
            channelDisplayName = localizeMessage({id: 'callingWidget.waitingForUsers', defaultMessage: 'Waiting for users'});
        }
        return (
            <>
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
                                onClick={this.onChannelLinkClick}
                                className='calls-channel-link'
                            >
                                {isPublicChannel(this.props.channel) ? <ChannelConvIcon fill='#9F9F9F'/> : <div className='content-body'>

                                    <Avatars
                                        userIds={Object.values(this.props.profiles).map((profile) => profile.id).filter((id) => id !== this.props.currentUserID)}
                                        size={'md'}
                                        totalUsers={Object.values(this.props.profiles).length - 1}
                                    />

                                </div>}
                                <span
                                    style={this.style.callChannelDisplay as CSSProperties}
                                >
                                    {channelDisplayName}
                                </span>
                            </a>
                            <button
                                id='calls-widget-expand-button'
                                className='style--none button-controls button-controls--wide'
                                style={this.style.expandButton as CSSProperties}
                                onClick={this.onExpandClick}
                            >
                                <ShowIcon
                                    style={{width: '16px', height: '16px'}}
                                />
                            </button>
                        </div>

                        <div
                            className='calls-widget-bottom-bar'
                            style={this.style.bottomBar}
                        >
                            <div
                                className='calls-widget-bottom-bar-left'
                                style={this.style.bottomBarLeft}
                            >
                                <WithTooltip
                                    key='mute'
                                    title={muteTooltipText}
                                >
                                    <button
                                        id='voice-mute-unmute'
                                        className='cursor--pointer style--none button-controls'
                                        style={muted ? this.style.activeButton : this.style.unActiveButton}
                                        onClick={this.onMuteToggle}
                                    >
                                        <MuteIcon
                                            fill={muted ? '#9F9F9F' : '#0098FF'}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                    </button>
                                </WithTooltip>
                                <WithTooltip
                                    key='camera'
                                    title={cameraTooltipText}
                                >
                                    <button
                                        id='camera-on-off'
                                        className='cursor--pointer style--none button-controls'
                                        style={video ? this.style.activeButton : this.style.unActiveButton}
                                        onClick={this.onVideoToggle}
                                    >
                                        <CameraIcon
                                            fill={video ? '#0098FF' : '#9F9F9F'}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                    </button>
                                </WithTooltip>
                                <WithTooltip
                                    key='screen-sharing'
                                    title={screenSharingTooltipText}
                                >
                                    <button
                                        id='screen-sharing-on-off'
                                        className='cursor--pointer style--none button-controls'
                                        style={screen ? this.style.activeButton : this.style.unActiveButton}
                                        onClick={this.onScreenshareToggle}
                                    >
                                        <ScreenSharingIcon
                                            fill={screen ? '#0098FF' : '#9F9F9F'}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                    </button>
                                </WithTooltip>
                            </div>

                            <WithTooltip
                                key='participants'
                                title={this.state.showParticipantsList ? 'Hide participants' : 'Show participants'}
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
                                    <CallUsersIcon
                                        style={{marginRight: '4px'}}
                                    />
                                    <span
                                        style={{fontWeight: 600, color: 'var(--center-channel-color)'}}
                                    >{Object.keys(this.props.profiles).length}</span>
                                </button>
                            </WithTooltip>

                            <WithTooltip
                                key='leave'
                                title={'Click to leave call'}
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
                            </WithTooltip>

                        </div>
                    </div>
                </div>
            </>
        );
    }
}
