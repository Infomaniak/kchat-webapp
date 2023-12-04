// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChangeEvent, RefObject} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import type {ValueType} from 'react-select';
import ReactSelect from 'react-select';
import semver from 'semver';

import RhsSettingsItem from 'components/rhs_settings/rhs_settings_item/rhs_settings_item';
import Toggle from 'components/toggle';

import {NotificationLevels} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';
import * as Utils from 'utils/utils';
import {localizeMessage} from 'utils/utils';

type SelectedOption = {
    label: string;
    value: string;
};

type Props = {
    activity: string;
    threads?: string;
    sound: string;
    updateSection: (section: string) => void;
    setParentState: (key: string, value: string | boolean) => void;
    submit: () => void;
    cancel: () => void;
    error: string;
    active: boolean;
    saving: boolean;
    selectedSound: string;
};

type State = {
    selectedOption: SelectedOption;
    blurDropdown: boolean;
};

export default class DesktopNotificationSettings extends React.PureComponent<Props, State> {
    dropdownSoundRef: RefObject<ReactSelect>;

    constructor(props: Props) {
        super(props);
        const selectedOption = {value: props.selectedSound, label: props.selectedSound};
        this.state = {
            selectedOption,
            blurDropdown: false,
        };
        this.dropdownSoundRef = React.createRef();
    }

    handleMinUpdateSection = (section: string): void => {
        this.props.updateSection(section);
        this.props.cancel();
    };

    handleMaxUpdateSection = (section: string): void => this.props.updateSection(section);

    handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const key = e.currentTarget.getAttribute('data-key');
        const value = e.currentTarget.getAttribute('data-value');
        if (key && value) {
            this.props.setParentState(key, value);
        }
    };

    handleOnSelectChange = (key, value): void => {
        if (key && value) {
            this.props.setParentState(key, value);
        }
    };

    handleThreadsOnChange = (value: 'mention' | 'all'): void => {
        this.props.setParentState('desktopThreads', value);
    };

    setDesktopNotificationSound: ReactSelect['onChange'] = (selectedOption: ValueType<SelectedOption>): void => {
        if (selectedOption && 'value' in selectedOption) {
            this.props.setParentState('desktopNotificationSound', selectedOption.value);
            this.setState({selectedOption});
            Utils.tryNotificationSound(selectedOption.value);
        }
    };

    blurDropdown(): void {
        if (!this.state.blurDropdown) {
            this.setState({blurDropdown: true});
            if (this.dropdownSoundRef.current) {
                this.dropdownSoundRef.current.blur();
            }
        }
    }

    createNotificationsSelect = (): JSX.Element => {
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
                        id='user.settings.notifications.desktop'
                        defaultMessage='Send desktop notifications'
                    />
                }
                inputs={
                    <ReactSelect
                        className='react-select settings-select advanced-select'
                        classNamePrefix='react-select'
                        id='desktopNotificationLevel'
                        key='desktopNotificationLevel'
                        options={options}
                        clearable={false}
                        onChange={(e) => this.handleOnSelectChange('desktopActivity', e.value)}
                        value={options.filter((opt: { value: string | boolean }) => opt.value === this.props.activity)}
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

    createNotificationsForThread = (): JSX.Element | undefined => {
        // if (NotificationLevels.MENTION === this.props.activity) {
        const inputs = (
            <Toggle
                id={name + 'childOption'}
                onToggle={() => this.handleThreadsOnChange(this.props.threads === NotificationLevels.ALL ? NotificationLevels.MENTION : NotificationLevels.ALL)}
                toggled={this.props.threads === NotificationLevels.ALL}
            />
        );

        return (
            <RhsSettingsItem
                id='desktopNotificationThread'
                title={
                    <FormattedMessage
                        id='user.settings.notifications.threads.desktop'
                        defaultMessage='Thread reply notifications'
                    />
                }
                inputs={inputs}
                submit={this.props.submit}
                saving={this.props.saving}
                server_error={this.props.error}
                updateSection={this.handleMaxUpdateSection}
                messageDesc={
                    <FormattedMessage
                        id='user.settings.notifications.threads'
                        defaultMessage="When enabled, any reply to a thread you're following will send a desktop notification."
                    />
                }
            />
        );

        // }
        // return undefined;
    };

    createSoundToggleSection = (): JSX.Element | undefined => {
        if (this.props.activity !== NotificationLevels.NONE) {
            const inputs = (
                <Toggle
                    id={name + 'childOption'}
                    onToggle={() => this.handleOnSelectChange('desktopSound', this.props.sound === 'false' ? 'true' : 'false')}
                    toggled={this.props.sound === 'true'}
                />
            );

            return (
                <RhsSettingsItem
                    id='desktopNotificationSoundToggle'
                    title={
                        <FormattedMessage
                            id='user.settings.notifications.desktop.sound'
                            defaultMessage='Notification sound'
                        />
                    }
                    inputs={inputs}
                    submit={this.props.submit}
                    saving={this.props.saving}
                    server_error={this.props.error}
                    updateSection={this.handleMaxUpdateSection}
                />
            );
        }
        return undefined;
    };

    createnotificationSelectionSection = (): JSX.Element | undefined => {
        let notificationSelection;

        if (this.props.activity !== NotificationLevels.NONE) {
            if (this.props.sound === 'true') {
                const sounds = Array.from(Utils.notificationSounds.keys());
                const options = sounds.map((sound) => {
                    return {value: sound, label: sound};
                });
                if (!isDesktopApp() || (window.desktop && semver.gte(window.desktop.version || '', '4.6.0'))) {
                    notificationSelection = (
                        <ReactSelect
                            className='react-select notification-sound-dropdown'
                            classNamePrefix='react-select'
                            id='displaySoundNotification'
                            options={options}
                            clearable={false}
                            onChange={this.setDesktopNotificationSound}
                            value={this.state.selectedOption}
                            isSearchable={false}
                            ref={this.dropdownSoundRef}
                        />);
                }
            }

            return (
                <section className='row rhs-settings-section rhs-custom-bb'>
                    <div className='col-sm-12'>
                        <div className='setting-list' >
                            {notificationSelection}
                        </div>
                    </div>
                </section>
            );
        }
        return undefined;
    };

    componentDidUpdate() {
        this.blurDropdown();
    }

    render() {
        const notificationsSelect = this.createNotificationsSelect();
        const threadNotifications = this.createNotificationsForThread();
        const soundToggle = this.createSoundToggleSection();
        const notificationSelection = this.createnotificationSelectionSection();
        return (
            <>
                {notificationsSelect}
                {threadNotifications}
                {soundToggle}
                {notificationSelection}
            </>
        );
    }
}

/* eslint-enable react/no-string-refs */

const reactStyles = {
    menuPortal: (provided: React.CSSProperties) => ({
        ...provided,
        zIndex: 9999,
        cursor: 'pointer',
    }),
};
