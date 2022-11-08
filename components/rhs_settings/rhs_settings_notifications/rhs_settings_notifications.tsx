// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React, {RefObject} from 'react';
import ReactSelect from 'react-select';
import semver from 'semver';

import {FormattedMessage} from 'react-intl';

import {UserNotifyProps, UserProfile} from '@mattermost/types/users';

import {ActionResult} from 'mattermost-redux/types/actions';

import Constants, {NotificationLevels} from 'utils/constants';
import {localizeMessage} from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';

// import SettingItemMin from 'components/setting_item_min';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';

import Toggle from 'components/toggle';

import DesktopNotificationSettings from './desktop_notification_setting/desktop_notification_settings';

export type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    activeSection: string;
    sendPushNotifications: boolean;
    enableAutoResponder: boolean;
    actions: {
        updateMe: (user: UserProfile) => Promise<ActionResult>;
    };
}

type State = {
    enableEmail: UserNotifyProps['email'];
    desktopActivity: UserNotifyProps['desktop'];
    desktopThreads: UserNotifyProps['desktop_threads'];
    pushThreads: UserNotifyProps['push_threads'];
    emailThreads: UserNotifyProps['email_threads'];
    pushActivity: UserNotifyProps['push'];
    pushStatus: UserNotifyProps['push_status'];
    desktopSound: UserNotifyProps['desktop_sound'];
    desktopNotificationSound: UserNotifyProps['desktop_notification_sound'];
    usernameKey: boolean;
    customKeys: string;
    customKeysChecked: boolean;
    firstNameKey: boolean;
    channelKey: boolean;
    autoResponderActive: boolean;
    autoResponderMessage: UserNotifyProps['auto_responder_message'];
    notifyCommentsLevel: UserNotifyProps['comments'];
    isSaving: boolean;
    serverError: string;
};

function getNotificationsStateFromProps(props: Props): State {
    const user = props.user;

    let desktop: UserNotifyProps['desktop'] = NotificationLevels.MENTION;
    let desktopThreads: UserNotifyProps['desktop_threads'] = NotificationLevels.ALL;
    let pushThreads: UserNotifyProps['push_threads'] = NotificationLevels.ALL;
    let emailThreads: UserNotifyProps['email_threads'] = NotificationLevels.ALL;
    let sound: UserNotifyProps['desktop_sound'] = 'true';
    let desktopNotificationSound: UserNotifyProps['desktop_notification_sound'] = 'Bing';
    let comments: UserNotifyProps['comments'] = 'never';
    let enableEmail: UserNotifyProps['email'] = 'true';
    let pushActivity: UserNotifyProps['push'] = NotificationLevels.MENTION;
    let pushStatus: UserNotifyProps['push_status'] = Constants.UserStatuses.AWAY;
    let autoResponderActive = false;
    let autoResponderMessage: UserNotifyProps['auto_responder_message'] = localizeMessage(
        'user.settings.notifications.autoResponderDefault',
        'Hello, I am out of office and unable to respond to messages.',
    );

    if (user.notify_props) {
        if (user.notify_props.desktop) {
            desktop = user.notify_props.desktop;
        }
        if (user.notify_props.desktop_threads) {
            desktopThreads = user.notify_props.desktop_threads;
        }
        if (user.notify_props.push_threads) {
            pushThreads = user.notify_props.push_threads;
        }
        if (user.notify_props.email_threads) {
            emailThreads = user.notify_props.email_threads;
        }
        if (user.notify_props.desktop_sound) {
            sound = user.notify_props.desktop_sound;
        }
        if (user.notify_props.desktop_notification_sound) {
            desktopNotificationSound = user.notify_props.desktop_notification_sound;
        }
        if (user.notify_props.comments) {
            comments = user.notify_props.comments;
        }
        if (user.notify_props.email) {
            enableEmail = user.notify_props.email;
        }
        if (user.notify_props.push) {
            pushActivity = user.notify_props.push;
        }
        if (user.notify_props.push_status) {
            pushStatus = user.notify_props.push_status;
        }

        if (user.notify_props.auto_responder_active) {
            autoResponderActive = user.notify_props.auto_responder_active === 'true';
        }

        if (user.notify_props.auto_responder_message) {
            autoResponderMessage = user.notify_props.auto_responder_message;
        }
    }

    let usernameKey = false;
    let customKeys = '';
    let firstNameKey = false;
    let channelKey = false;

    if (user.notify_props) {
        if (user.notify_props.mention_keys) {
            const keys = user.notify_props.mention_keys.split(',');

            if (keys.indexOf(user.username) === -1) {
                usernameKey = false;
            } else {
                usernameKey = true;
                keys.splice(keys.indexOf(user.username), 1);
                if (keys.indexOf(`@${user.username}`) !== -1) {
                    keys.splice(keys.indexOf(`@${user.username}`), 1);
                }
            }

            customKeys = keys.join(',');
        }

        if (user.notify_props.first_name) {
            firstNameKey = user.notify_props.first_name === 'true';
        }

        if (user.notify_props.channel) {
            channelKey = user.notify_props.channel === 'true';
        }
    }

    return {
        desktopActivity: desktop,
        desktopThreads,
        pushThreads,
        emailThreads,
        enableEmail,
        pushActivity,
        pushStatus,
        desktopSound: sound,
        desktopNotificationSound,
        usernameKey,
        customKeys,
        customKeysChecked: customKeys.length > 0,
        firstNameKey,
        channelKey,
        autoResponderActive,
        autoResponderMessage,
        notifyCommentsLevel: comments,
        isSaving: false,
        serverError: '',
    };
}

export default class RhsNotificationsTab extends React.PureComponent<Props, State> {
    customCheckRef: RefObject<HTMLInputElement>;
    customMentionsRef: RefObject<HTMLInputElement>;
    drawerRef: RefObject<HTMLHeadingElement>;
    wrapperRef: RefObject<HTMLDivElement>;

    static defaultProps = {
        activeSection: '',
    }

    constructor(props: Props) {
        super(props);

        this.state = getNotificationsStateFromProps(props);
        this.customCheckRef = React.createRef();
        this.customMentionsRef = React.createRef();
        this.drawerRef = React.createRef();
        this.wrapperRef = React.createRef();
    }

    handleSubmit = (): void => {
        const data: UserNotifyProps = {} as UserNotifyProps;
        data.email = this.state.enableEmail;
        data.desktop_sound = this.state.desktopSound;
        if (!isDesktopApp() || (window.desktop && semver.gte(window.desktop.version || '', '4.6.0'))) {
            data.desktop_notification_sound = this.state.desktopNotificationSound;
        }
        data.desktop = this.state.desktopActivity;
        data.desktop_threads = this.state.desktopThreads;
        data.email_threads = this.state.emailThreads;
        data.push_threads = this.state.pushThreads;
        data.push = this.state.pushActivity;
        data.push_status = this.state.pushStatus;
        data.comments = this.state.notifyCommentsLevel;
        data.auto_responder_active = this.state.autoResponderActive.toString() as UserNotifyProps['auto_responder_active'];
        data.auto_responder_message = this.state.autoResponderMessage;

        if (!data.auto_responder_message || data.auto_responder_message === '') {
            data.auto_responder_message = localizeMessage(
                'user.settings.notifications.autoResponderDefault',
                'Hello, I am out of office and unable to respond to messages.',
            );
        }

        const mentionKeys = [];
        if (this.state.usernameKey) {
            mentionKeys.push(this.props.user.username);
        }

        let stringKeys = mentionKeys.join(',');
        if (this.state.customKeys.length > 0 && this.state.customKeysChecked) {
            stringKeys += ',' + this.state.customKeys;
        }

        data.mention_keys = stringKeys;
        data.first_name = this.state.firstNameKey.toString() as UserNotifyProps['first_name'];
        data.channel = this.state.channelKey.toString() as UserNotifyProps['channel'];

        this.setState({isSaving: true});

        this.props.actions.updateMe({notify_props: data} as UserProfile).
            then(({data: result, error: err}) => {
                if (result) {
                    this.handleUpdateSection('');
                    this.setState(getNotificationsStateFromProps(this.props));
                } else if (err) {
                    this.setState({serverError: err.message, isSaving: false});
                }
            });
    }

    handleCancel = (): void => this.setState(getNotificationsStateFromProps(this.props));

    handleUpdateSection = (section: string): void => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');
        }
        this.setState({isSaving: false});
        this.handleCancel();
    };

    setStateValue = (key: string, value: string | boolean): void => {
        const data: {[key: string]: string | boolean } = {};
        data[key] = value;
        this.setState((prevState) => ({...prevState, ...data}), () => {
            this.handleSubmit();
        });
    }

    createPushActivitySection = () => {
        const options = [
            {
                value: NotificationLevels.ALL,
                label: localizeMessage('user.settings.notifications.allActivity', 'For all activity'),
            },
            {
                value: NotificationLevels.MENTION,
                label: localizeMessage('user.settings.notifications.onlyMentions', 'Only for mentions and direct messages'),
            },
            {value: NotificationLevels.NONE, label: localizeMessage('user.settings.notifications.never', 'Never')},
        ];
        return (
            <RhsSettingsItem
                key='desktopNotifications'
                title={
                    <FormattedMessage
                        id='channel_notifications.push'
                        defaultMessage='Send mobile push notifications'
                    />
                }
                inputs={
                    <ReactSelect
                        className='react-select settings-select advanced-select'
                        classNamePrefix='react-select'
                        id='pushNotificationLevel'
                        key='pushNotificationLevel'
                        options={options}
                        clearable={false}
                        value={options.filter((opt: { value: string | boolean }) => opt.value === this.state.pushActivity)}
                        onChange={(e) => this.setStateValue('pushActivity', e?.value)}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                    />
                }
                updateSection={
                    this.props.updateSection
                }
            />
        );
    };

    createPushNotificationSection = () => {
        const options = [
            {
                value: Constants.UserStatuses.ONLINE,
                label: localizeMessage('user.settings.push_notification.online', 'Online, away or offline'),
            },
            {
                value: Constants.UserStatuses.AWAY,
                label: localizeMessage('user.settings.push_notification.away', 'Away or offline'),
            },
            {value: Constants.UserStatuses.OFFLINE, label: localizeMessage('user.settings.push_notification.offline', 'Offline')},
        ];

        return (
            <RhsSettingsItem
                key='desktopNotifications'
                title={
                    <FormattedMessage
                        id='user.settings.notifications.push_notification.status'
                        defaultMessage='Trigger push notifications when'
                    />
                }
                inputs={
                    <ReactSelect
                        className='react-select settings-select advanced-select'
                        classNamePrefix='react-select'
                        id='threadsPushLevel'
                        key='threadsPushLevel'
                        options={options}
                        clearable={false}
                        value={options.filter((opt: { value: string | boolean }) => opt.value === this.state.pushStatus)}
                        onChange={(e) => this.setStateValue('pushStatus', e?.value)}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                    />
                }
                updateSection={
                    this.props.updateSection
                }
            />
        );
    }

    createPushThreadsSection = () => {
        return (
            <RhsSettingsItem
                key='threadsPush'
                title={
                    <FormattedMessage
                        id='user.settings.notifications.threads.desktop'
                        defaultMessage='Thread reply notifications'
                    />
                }
                inputs={
                    <Toggle
                        id={name + 'childOption'}
                        onToggle={() => this.setStateValue('pushThreads', this.state.pushThreads === NotificationLevels.ALL ? NotificationLevels.MENTION : NotificationLevels.ALL)}
                        toggled={this.state.pushThreads === NotificationLevels.ALL}
                    />
                }
                updateSection={
                    this.props.updateSection
                }
                messageDesc={
                    <FormattedMessage
                        id='user.settings.notifications.push_threads'
                        defaultMessage={'When enabled, any reply to a thread you\'re following will send a mobile push notification.'}
                    />
                }
                containerStyle='rhs-custom-bb'
            />
        );
    };

    render() {
        return (
            <div id='notificationSettings'>
                <div className='user-settings user-rhs-container container mt-0'>
                    <h5>
                        <FormattedMessage
                            id='user.settings.notifications.push'
                            defaultMessage='Mobile Push Notifications'
                        />
                    </h5>
                    <div className='divider-dark mt-5 rhs-custom-bb'/>
                    {this.createPushNotificationSection()}
                    {this.createPushActivitySection()}
                    {this.createPushThreadsSection()}
                    <div className='divider-dark'/>
                    <h5>
                        <FormattedMessage
                            id='user.settings.notifications.desktop.title'
                            defaultMessage='Desktop Notifications'
                        />
                    </h5>
                    <div className='divider-dark mt-5 rhs-custom-bb'/>
                    <DesktopNotificationSettings
                        activity={this.state.desktopActivity}
                        threads={this.state.desktopThreads}
                        sound={this.state.desktopSound}
                        updateSection={this.handleUpdateSection}
                        setParentState={this.setStateValue}
                        submit={this.handleSubmit}
                        saving={this.state.isSaving}
                        cancel={this.handleCancel}
                        error={this.state.serverError}
                        active={this.props.activeSection === 'desktop'}
                        selectedSound={this.state.desktopNotificationSound || 'default'}
                    />
                </div>
            </div>

        );
    }
}

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
        cursor: 'pointer',
    }),
};
