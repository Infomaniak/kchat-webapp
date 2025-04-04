// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import type {RefObject} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import type {ValueType} from 'react-select';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import semver from 'semver';

import type {PreferenceType} from '@mattermost/types/preferences';
import type {UserNotifyProps, UserProfile} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';

// import SettingItemMin from 'components/setting_item_min';

import Toggle from 'components/toggle';

import Constants, {NotificationLevels, Preferences} from 'utils/constants';
import {t} from 'utils/i18n';
import {isDesktopApp} from 'utils/user_agent';
import {localizeMessage, moveCursorToEnd} from 'utils/utils';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';

import './rhs_settings_notifications.scss';
import DesktopNotificationSettings from './desktop_notification_setting/desktop_notification_settings';
type InputProps ={
    display: string;
    description: {
        id: string;
        message: string;
    };
    title: {
        id: string;
        message: string;
    };
}
export type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    activeSection: string;
    sendPushNotifications: boolean;
    enableAutoResponder: boolean;
    emailInterval: number;
    actions: {
        updateMe: (user: UserProfile) => Promise<ActionResult>;
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
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
    emailInterval: number;
    keywordsValues: Array<{ label: string; value: string }>;
    inputValue: string;
    showSelect: boolean;
};

function getNotificationsStateFromProps(props: Props, state?: State): State {
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
    let autoResponderMessage: UserNotifyProps['auto_responder_message'] = localizeMessage({
        id: 'user.settings.notifications.autoResponderDefault',
        defaultMessage: 'Hello, I am out of office and unable to respond to messages.',
    });

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
        customKeysChecked: state?.customKeysChecked || false,
        firstNameKey,
        channelKey,
        autoResponderActive,
        autoResponderMessage,
        notifyCommentsLevel: comments,
        isSaving: false,
        serverError: '',
        keywordsValues: state?.keywordsValues || [],
        inputValue: state?.inputValue || '',
        showSelect: state?.showSelect || false,
        emailInterval: props.emailInterval,
    };
}

const DEBOUNCE_DELAY = 500;

export default class RhsNotificationsTab extends React.PureComponent<Props, State> {
    customCheckRef: RefObject<HTMLInputElement>;
    customMentionsRef: RefObject<HTMLInputElement>;
    drawerRef: RefObject<HTMLHeadingElement>;
    wrapperRef: RefObject<HTMLDivElement>;
    mentionKeysInputRef: RefObject<HTMLInputElement>;
    autoResponderInputRef: RefObject<HTMLInputElement>;

    static defaultProps = {
        activeSection: '',
    };

    constructor(props: Props) {
        super(props);

        this.state = getNotificationsStateFromProps(props);
        this.customCheckRef = React.createRef();
        this.customMentionsRef = React.createRef();
        this.drawerRef = React.createRef();
        this.wrapperRef = React.createRef();
        this.mentionKeysInputRef = React.createRef();
        this.autoResponderInputRef = React.createRef();
    }

    componentWillUnmount() {
        this.handleAutoResponderInput.flush();
        this.handleMentionKeysInput.flush();
    }

    componentDidMount(): void {
        const {user} = this.props;
        const keywords = user.notify_props.mention_keys || null;
        const keywordsArray = keywords ? keywords.split(',').map((keyword) => this.createOption(keyword)) : [];
        this.setState({
            keywordsValues: keywordsArray,
            showSelect: keywordsArray.length > 0,
        });
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
            data.auto_responder_message = localizeMessage({
                id: 'user.settings.notifications.autoResponderDefault',
                defaultMessage: 'Hello, I am out of office and unable to respond to messages.',
            });
        }

        data.first_name = this.state.firstNameKey.toString() as UserNotifyProps['first_name'];
        data.channel = this.state.channelKey.toString() as UserNotifyProps['channel'];
        data.mention_keys = (this.state.keywordsValues || []).map((keyword: { value: string }) => keyword.value).join(',');

        this.setState({isSaving: true});

        this.props.actions.updateMe({notify_props: data} as UserProfile).
            then(({data: result, error: err}) => {
                if (result) {
                    this.handleUpdateSection('');
                    this.setState(getNotificationsStateFromProps(this.props, this.state));
                } else if (err) {
                    this.setState({serverError: err.message, isSaving: false});
                }
            });
    };

    handleCancel = (): void => this.setState(getNotificationsStateFromProps(this.props, this.state));

    handleUpdateSection = (section: string): void => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');
        }
        this.setState({isSaving: false});
        this.handleCancel();
    };

    handleSaveEmailInterval = async (interval: string) => {
        const emailIntervalPreference = {
            user_id: this.props.user.id,
            category: Preferences.CATEGORY_NOTIFICATIONS,
            name: Preferences.EMAIL_INTERVAL,
            value: interval.toString(),
        };

        //this.setStateValue('emailInterval', interval.toString());
        this.props.actions.savePreferences(this.props.user.id, [emailIntervalPreference]);
        this.setState((prevState) => ({...prevState, emailInterval: Number(interval)}));
    };

    setEmailDescriptionMessage() {
        if (Number(this.props.emailInterval) === Preferences.INTERVAL_DAY) {
            return localizeMessage({id: 'user.settings.notifications.email.subtitle.daily', defaultMessage: 'The e-mail will be sent to your inbox between 06:00 and 08:00 a.m. each day.'});
        } else if (Number(this.props.emailInterval) === Preferences.INTERVAL_WEEK) {
            return localizeMessage({id: 'user.settings.notifications.email.subtitle.weekly', defaultMessage: 'The e-mail will be sent to your inbox between 06:00 and 08:00 every Monday morning.'});
        }
        return '';
    }

    setStateValue = (key: string, value: string | boolean): void => {
        const data: {[key: string]: string | boolean } = {};
        data[key] = value;
        this.setState((prevState) => ({...prevState, ...data}), () => {
            this.handleSubmit();
        });
    };

    createPushActivitySection = () => {
        const options = [
            {
                value: NotificationLevels.ALL,
                label: localizeMessage({id: 'user.settings.notifications.allActivity', defaultMessage: 'For all activity'}),
            },
            {
                value: NotificationLevels.MENTION,
                label: localizeMessage({id: 'user.settings.notifications.onlyMentions', defaultMessage: 'Only for mentions and direct messages'}),
            },
            {value: NotificationLevels.NONE, label: localizeMessage({id: 'user.settings.notifications.never', defaultMessage: 'Never'})},
        ];
        return (
            <RhsSettingsItem
                key='pushNotifications'
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

    createOption = (label: string) => ({
        label,
        value: label,
    });

    createInput(props: InputProps) {
        const {
            display,
            description,
            title,
        } = props;

        const messageTitle = (
            <FormattedMessage
                id={title.id}
                defaultMessage={title.message}
            />
        );

        const messageDesc = (
            <FormattedMessage
                id={description.id}
                defaultMessage={description.message}
            />
        );

        const helpMessage = (
            <FormattedMessage
                id={'user.settings.display.keywords_help'}
                defaultMessage={'Press Tab or use commas to separate keywords.'}
            />
        );

        const placeholderMessage = (
            <FormattedMessage
                id={'user.settings.display.keywords_placeholder'}
                defaultMessage={'Keywords'}
            />
        );

        const handleKeyDown = (event: React.KeyboardEvent) => {
            if (!this.state.inputValue) {
                return;
            }

            const newKeywords = this.state.inputValue.split(',').map((keyword: string) => this.createOption(keyword.trim()));

            switch (event.key) {
            case 'Enter':
            case 'Tab':
                this.setState((prevState) => ({
                    keywordsValues: Array.isArray(prevState.keywordsValues) ? [...prevState.keywordsValues, ...newKeywords] : newKeywords,
                    inputValue: '',
                }), () => {
                    this.handleSubmit();
                });
                event.preventDefault();
                break;
            default:
                break;
            }
        };

        const handleOnChange = (newValues: ValueType<{ label: string; value: string }>) => {
            const valuesArray = Array.isArray(newValues) ? newValues : [];
            this.setState({keywordsValues: valuesArray}, () => {
                this.handleSubmit();
            });
        };

        const toggleSelectVisibility = () => {
            this.setState((prevState) => {
                const newShowSelect = !prevState.showSelect;
                const newKeywordsValues = newShowSelect ? prevState.keywordsValues : [];

                return {
                    showSelect: newShowSelect,
                    keywordsValues: newKeywordsValues,
                    inputValue: newShowSelect ? prevState.inputValue : '',
                };
            }, async () => {
                if (!this.state.showSelect) {
                    this.handleSubmit();
                }
            });
        };

        const handleInputChange = (inputValue: string) => {
            this.setState({inputValue});
        };

        const handleBlur = () => {
            if (!this.state.inputValue) {
                return;
            }

            const newKeywords = this.state.inputValue.split(',').map((keyword: string) => this.createOption(keyword.trim()));

            this.setState((prevState) => ({
                keywordsValues: Array.isArray(prevState.keywordsValues) ? [...prevState.keywordsValues, ...newKeywords] : newKeywords,
                inputValue: '',
            }), () => {
                this.handleSubmit();
            });
        };

        return (
            <>
                <RhsSettingsItem
                    key={display}
                    title={messageTitle}
                    inputs={
                        <div>
                            <div>
                                <Toggle
                                    onToggle={toggleSelectVisibility}
                                    toggled={this.state.showSelect}
                                />
                            </div>

                        </div>
                    }
                    saving={this.state.isSaving}
                    messageDesc={messageDesc}
                    updateSection={this.props.updateSection}
                />
                {this.state.showSelect && (
                    <div className='users-settings'>
                        <CreatableSelect
                            isClearable={true}
                            isMulti={true}
                            menuIsOpen={false}
                            onChange={handleOnChange}
                            onInputChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            value={this.state.keywordsValues}
                            inputValue={this.state.inputValue}
                            placeholder={placeholderMessage}
                            components={{DropdownIndicator: null, IndicatorSeparator: null}}
                            onBlur={handleBlur}
                        />
                        <div className='settings-desc help-keyword'>
                            {helpMessage}
                        </div>
                    </div>
                )}
            </>
        );
    }

    createPushNotificationSection = () => {
        const options = [
            {
                value: Constants.UserStatuses.ONLINE,
                label: localizeMessage({id: 'user.settings.push_notification.online', defaultMessage: 'Online, away or offline'}),
            },
            {
                value: Constants.UserStatuses.AWAY,
                label: localizeMessage({id: 'user.settings.push_notification.away', defaultMessage: 'Away or offline'}),
            },
            {
                value: Constants.UserStatuses.OFFLINE,
                label: localizeMessage({id: 'user.settings.push_notification.offline', defaultMessage: 'Offline'}),
            },
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
    };

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

    createMentionKeysSection = () => {
        const {user} = this.props;

        const options = [
            {
                value: 'select',
                label: (
                    <div
                        key='mention-keys-select-select'
                        className='settings-item__select'
                    >
                        <FormattedMessage
                            id='user.settings.select'
                            defaultMessage='Select'
                        />
                    </div>
                ),
            },
        ];

        if (user.first_name) {
            options.push({
                value: 'fistname',
                label: (
                    <div
                        key='mention-keys-select-firstname'
                        className='settings-item__select'
                        onClick={(e: React.MouseEvent) => this.onMentionKeySelect(e, 'firstNameKey', !this.state.firstNameKey)}
                    >
                        <input
                            id='notificationTriggerFirst'
                            type='checkbox'
                            checked={this.state.firstNameKey}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.sensitiveName'
                            defaultMessage='Your case sensitive first name "{first_name}"'
                            values={{
                                first_name: user.first_name,
                            }}
                        />
                    </div>
                ),
            });
        }

        options.push(
            {
                value: 'non_sensitive',
                label: (
                    <div
                        key='mention-keys-select-non-sensitive'
                        className='settings-item__select'
                        onClick={(e: React.MouseEvent) => this.onMentionKeySelect(e, 'usernameKey', !this.state.usernameKey)}
                    >
                        <input
                            id='notificationTriggerUsername'
                            type='checkbox'
                            checked={this.state.usernameKey}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.sensitiveUsername'
                            defaultMessage='Your non case-sensitive username "{username}"'
                            values={{
                                username: user.username,
                            }}
                        />
                    </div>
                ),
            },
            {
                value: 'wide',
                label: (
                    <div
                        key='mention-keys-select-wide'
                        className='settings-item__select'
                        onClick={(e: React.MouseEvent) => this.onMentionKeySelect(e, 'channelKey', !this.state.channelKey)}
                    >
                        <input
                            id='notificationTriggerShouts'
                            type='checkbox'
                            checked={this.state.channelKey}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.channelWide'
                            defaultMessage='Channel-wide mentions "@channel", "@all", "@here"'
                        />
                    </div>
                ),
            },
            {
                value: 'custom',
                label: (
                    <div
                        key='mention-keys-select-custom'
                        className='settings-item__select'
                        onClick={(e: React.MouseEvent) => this.onMentionKeySelect(e, 'customKeysChecked', !this.state.customKeysChecked)}
                    >
                        <input
                            id='notificationTriggerCustom'
                            type='checkbox'
                            checked={this.state.customKeysChecked}
                        />
                        <FormattedMessage
                            id='user.settings.notifications.sensitiveWords'
                            defaultMessage='Other non-case sensitive words, separated by commas:'
                        />
                    </div>
                ),
            },
        );

        return (
            <RhsSettingsItem
                key='mentionKeys'
                title={localizeMessage({id: 'user.settings.notifications.wordsTrigger', defaultMessage: 'Words That Trigger Mentions'})}
                inputs={[
                    <ReactSelect
                        className='react-select settings-select advanced-select'
                        classNamePrefix='react-select'
                        id='mentionKeysSelect'
                        key='mention-keys-inputs'
                        options={options}
                        clearable={false}
                        value={options.filter((option) => option.value === 'select')}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                    />,
                ]}
                subtitle={(
                    <div
                        key='mention-keys-subtitle'
                        className='settings-item__input'
                    >
                        <input
                            key='mention-keys-input'
                            ref={this.mentionKeysInputRef}
                            className={classNames('form-control', 'mentions-input', {'settings-item__disabled': !this.state.customKeysChecked})}
                            onInput={this.handleMentionKeysInput}
                            autoFocus={this.state.customKeysChecked}
                            type='text'
                            placeholder={localizeMessage({id: 'user.settings.notifications.mentionsSubtitle', defaultMessage: 'Mentions'})}
                            defaultValue={this.state.customKeys}
                            onFocus={moveCursorToEnd}
                            aria-labelledby='notificationTriggerCustom'
                        />
                    </div>
                )}
                updateSection={this.handleUpdateSection}
                messageDesc={localizeMessage({id: 'user.settings.notifications.mentionsInfo', defaultMessage: 'Mentions trigger when someone sends a message that includes your username (@{username}) or any of the options selected above.'})}
            />
        );
    };

    createAutoResponderSection = () => {
        if (!this.props.enableAutoResponder) {
            return null;
        }

        return (
            <RhsSettingsItem
                key='autoResponder'
                title={
                    <FormattedMessage
                        id='user.settings.notifications.autoResponder'
                        defaultMessage='Automatic Direct Message Replies'
                    />
                }
                inputs={[
                    <Toggle
                        key='auto-responder-toggle'
                        onToggle={() => this.setStateValue('autoResponderActive', !this.state.autoResponderActive)}
                        toggled={this.state.autoResponderActive}
                    />,
                ]}
                subtitle={(
                    <div
                        key='auto-responder-subtitle'
                        className='settings-item__input'
                    >
                        <input
                            key='auto-responder-input'
                            ref={this.autoResponderInputRef}
                            className={classNames('form-control', {'settings-item__disabled': !this.state.autoResponderActive})}
                            onInput={this.handleAutoResponderInput}
                            type='text'
                            placeholder={localizeMessage({id: 'user.settings.notifications.autoResponderPlaceholder', defaultMessage: 'Message'})}
                            autoFocus={this.state.autoResponderActive}
                            onFocus={moveCursorToEnd}
                            defaultValue={localizeMessage({id: 'user.settings.notifications.autoResponderDefault', defaultMessage: 'Hello, I am out of office and unable to respond to messages.'})}
                        />
                    </div>
                )}
                updateSection={this.handleUpdateSection}
                messageDesc={localizeMessage({id: 'user.settings.notifications.autoResponderHint', defaultMessage: 'Set a custom message that will be automatically sent in response to Direct Messages. Mentions in Public and Private Channels will not trigger the automated reply. Enabling Automatic Replies sets your status to Out of Office and disables email and push notifications.'})}
            />
        );
    };

    createEmailNotificationSection = () => {
        const options = [
            {
                value: true,
                label: localizeMessage({id: 'user.settings.notifications.email.unreads', defaultMessage: 'For unread mentions and direct messages'}),
            },
            {
                value: false,
                label: localizeMessage({id: 'user.settings.notifications.never', defaultMessage: 'Never'}),
            },
        ];

        const frequencyOptions = [
            {
                value: Preferences.INTERVAL_DAY,
                label: localizeMessage({id: 'user.settings.notifications.email.frequency.daily', defaultMessage: 'Once a day'}),
            },

            // Add this delay when it will be available
            /*{
                value: Constants.EmailNotificationStatuses.FREQUENCY.WITHOUT_WEEKEND,
                label: localizeMessage({id: 'user.settings.notifications.email.frequency.daily.monday.to.friday', defaultMessage: 'Once a day (Monday to Friday)'}),
            },*/
            {
                value: Preferences.INTERVAL_WEEK,
                label: localizeMessage({id: 'user.settings.notifications.email.frequency.weekly', defaultMessage: 'Once a week'}),
            },
        ];

        // set the default value to "DAILY".
        if (this.state.enableEmail && this.state.emailInterval === 0) {
            this.handleSaveEmailInterval(Preferences.INTERVAL_DAY.toString());
        }

        return (
            <>
                <RhsSettingsItem
                    key='emailNotifications'
                    title={
                        <FormattedMessage
                            id='user.settings.notifications.email.send'
                            defaultMessage='Send email notifications'
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
                            value={options.filter((option) => option.value === (this.state.enableEmail === 'true'))}
                            onChange={(e) => {
                                this.setStateValue('enableEmail', e?.value?.toString());
                                if (!e?.value) {
                                    this.handleSaveEmailInterval('0');
                                }
                            }}
                            isSearchable={false}
                            menuPortalTarget={document.body}
                            styles={reactToTheTopStyles}
                        />
                    }
                    updateSection={
                        this.props.updateSection
                    }
                />
                {
                    this.state.enableEmail === 'true' &&
                    <RhsSettingsItem
                        key='emailFrequencyNotifications'
                        title={
                            <FormattedMessage
                                id='user.settings.notifications.email.frequency'
                                defaultMessage='Mailing frequency'
                            />
                        }
                        inputs={
                            <ReactSelect
                                className='react-select settings-select advanced-select'
                                classNamePrefix='react-select'
                                id='threadsPushLevel'
                                key='threadsPushLevel'
                                options={frequencyOptions}
                                clearable={false}
                                value={frequencyOptions.filter((opt: { value: number }) => opt.value === this.state.emailInterval)}
                                onChange={(e) => this.handleSaveEmailInterval(e?.value)}
                                isSearchable={false}
                                menuPortalTarget={document.body}
                                styles={reactToTheTopStyles}
                            />
                        }
                        updateSection={
                            this.props.updateSection
                        }
                        messageDesc={this.setEmailDescriptionMessage()}
                    />
                }
            </>
        );
    };

    onMentionKeySelect = (e: React.MouseEvent, state: string, value: string | boolean) => {
        e.preventDefault();
        e.stopPropagation();
        this.setStateValue(state, value);
    };

    handleMentionKeysInput = debounce(() => {
        if (this.mentionKeysInputRef.current) {
            this.setStateValue('customKeys', this.mentionKeysInputRef.current.value.trim());
        }
    }, DEBOUNCE_DELAY);

    handleAutoResponderInput = debounce(() => {
        if (this.autoResponderInputRef.current) {
            this.setStateValue('autoResponderMessage', this.autoResponderInputRef.current.value);
        }
    }, DEBOUNCE_DELAY);

    render() {
        const keywordsSection = this.createInput({
            display: 'keywordDisplay',
            title: {
                id: t('user.settings.display.keywords'),
                message: 'Receive notifications for certain keywords',
            },
            description: {
                id: t('user.settings.display.keywords_desc'),
                message: 'Keywords are case insensitive.',
            },
        });

        return (
            <div id='notificationSettings'>
                <div className='user-settings user-rhs-container container mt-0'>
                    {/*{this.createMentionKeysSection()}*/}
                    {/*{this.createAutoResponderSection()}*/}
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
                    <h5>
                        <FormattedMessage
                            id='user.settings.notifications.email.title'
                            defaultMessage='Unread e-mail notifications'
                        />
                    </h5>
                    <div className='divider-dark mt-5 rhs-custom-bb'/>
                    {this.createEmailNotificationSection()}
                    <div className='divider-dark mt-5 rhs-custom-bb'/>
                    {keywordsSection}
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

const reactToTheTopStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
        cursor: 'pointer',
    }),
    menu: (provided: any) => ({
        ...provided,
        position: 'absolute',
        top: 'auto',
        bottom: 0,
    }),
};
