// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import ReactSelect, {ValueType} from 'react-select';

import Constants, {Preferences} from 'utils/constants';
import {t} from 'utils/i18n';
import {isMac, localizeMessage} from 'utils/utils';

import {UserProfile} from '@mattermost/types/users';
import {PreferenceType} from '@mattermost/types/preferences';

import {ActionResult} from 'mattermost-redux/types/actions';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

type Settings = {
    [key: string]: string | number | undefined;
    send_on_ctrl_enter: Props['sendOnCtrlEnter'];
    code_block_ctrl_enter: Props['codeBlockOnCtrlEnter'];
    formatting: Props['formatting'];
    join_leave: Props['joinLeave'];
    enterSelect: number;
    unreadSelect: number;
};

export type Props = {
    currentUser: UserProfile;
    advancedSettingsCategory: PreferenceType[];
    isAdvancedTextEditorEnabled: boolean;
    sendOnCtrlEnter: string;
    codeBlockOnCtrlEnter: string;
    formatting: string;
    joinLeave: string;
    unreadScrollPosition: string;
    updateSection: (section?: string) => void;
    activeSection: string;
    closeModal: () => void;
    collapseModal: () => void;
    enablePreviewFeatures: boolean;
    enableUserDeactivation: boolean;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
        updateUserActive: (userId: string, active: boolean) => Promise<ActionResult>;
        revokeAllSessionsForUser: (userId: string) => Promise<ActionResult>;
    };
};

type State = {
    preReleaseFeatures: typeof PreReleaseFeatures;
    settings: Settings;
    enabledFeatures: number;
    isSaving: boolean;
    previewFeaturesEnabled: boolean;
    showDeactivateAccountModal: boolean;
    serverError: string;
    preReleaseFeaturesKeys: string[];
}

export default class AdvancedRhsSettingsDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = this.getStateFromProps();
    }

    getStateFromProps = (): State => {
        const advancedSettings = this.props.advancedSettingsCategory;
        let selectEnter = 0;
        if (this.props.sendOnCtrlEnter === 'true') {
            selectEnter = 0;
        } else if (this.props.sendOnCtrlEnter === 'false' && this.props.codeBlockOnCtrlEnter === 'true') {
            selectEnter = 1;
        } else if (this.props.sendOnCtrlEnter === 'false' && this.props.codeBlockOnCtrlEnter === 'false') {
            selectEnter = 2;
        }

        let unreadSelect = 0;
        if (this.props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT) {
            unreadSelect = 0;
        } else if (this.props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST) {
            unreadSelect = 1;
        }

        const settings: Settings = {
            send_on_ctrl_enter: this.props.sendOnCtrlEnter,
            code_block_ctrl_enter: this.props.codeBlockOnCtrlEnter,
            formatting: this.props.formatting,
            join_leave: this.props.joinLeave,
            [Preferences.UNREAD_SCROLL_POSITION]: this.props.unreadScrollPosition,
            enterSelect: selectEnter,
            unreadSelect,
        };

        const PreReleaseFeaturesLocal = JSON.parse(JSON.stringify(PreReleaseFeatures));
        if (this.props.isAdvancedTextEditorEnabled) {
            delete PreReleaseFeaturesLocal.MARKDOWN_PREVIEW;
        }
        const preReleaseFeaturesKeys = Object.keys(PreReleaseFeaturesLocal);

        let enabledFeatures = 0;
        for (const as of advancedSettings) {
            for (const key of preReleaseFeaturesKeys) {
                const feature = PreReleaseFeaturesLocal[key];

                if (as.name === Constants.FeatureTogglePrefix + feature.label) {
                    settings[as.name] = as.value;

                    if (as.value === 'true') {
                        enabledFeatures += 1;
                    }
                }
            }
        }

        const isSaving = false;

        const previewFeaturesEnabled = this.props.enablePreviewFeatures;
        const showDeactivateAccountModal = false;

        return {
            preReleaseFeatures: PreReleaseFeaturesLocal,
            settings,
            preReleaseFeaturesKeys,
            enabledFeatures,
            isSaving,
            previewFeaturesEnabled,
            showDeactivateAccountModal,
            serverError: '',
        };
    }

    updateSetting = (setting: string, value: string | number): void => {
        console.log(setting, value);

        const settings = this.state.settings;
        settings[setting] = value;

        this.setState((prevState) => ({...prevState, ...settings}));
    }

    handleSubmit = async (settings: string[]): Promise<void> => {
        const preferences: PreferenceType[] = [];
        const {actions, currentUser} = this.props;
        const userId = currentUser.id;

        // this should be refactored so we can actually be certain about what type everything is
        (Array.isArray(settings) ? settings : [settings]).forEach((setting) => {
            preferences.push({
                user_id: userId,
                category: Constants.Preferences.CATEGORY_ADVANCED_SETTINGS,
                name: setting,
                value: this.state.settings[setting],
            });
        });

        this.setState({isSaving: true});

        await actions.savePreferences(userId, preferences);

    }

    // This function changes ctrl to cmd when OS is mac
    getCtrlSendText = () => {
        const description = {
            default: {
                id: t('user.settings.advance.sendDesc'),
                defaultMessage: 'When enabled, CTRL + ENTER will send the message and ENTER inserts a new line.',
            },
            mac: {
                id: t('user.settings.advance.sendDesc.mac'),
                defaultMessage: 'When enabled, ⌘ + ENTER will send the message and ENTER inserts a new line.',
            },
        };
        const title = {
            default: {
                id: t('user.settings.advance.sendTitle'),
                defaultMessage: 'Send Messages on CTRL+ENTER',
            },
            mac: {
                id: t('user.settings.advance.sendTitle.mac'),
                defaultMessage: 'Send Messages on ⌘+ENTER',
            },
        };
        if (isMac()) {
            return {
                ctrlSendTitle: title.mac,
                ctrlSendDesc: description.mac,
            };
        }
        return {
            ctrlSendTitle: title.default,
            ctrlSendDesc: description.default,
        };
    }

    renderUnreadScrollPositionSection = () => {
        const handleUnreadSelectChange = (selected: ValueType<any>) => {
            const settings = this.state.settings;

            switch (selected.value) {
            case 0: {
                settings.unread_scroll_position = Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT;
                settings.unreadSelect = 0;
                break;
            }
            case 1: {
                settings.unread_scroll_position = Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST;
                settings.unreadSelect = 1;
                break;
            }
            }

            this.setState((prevState) => ({...prevState, ...settings}),
                () => {
                    this.handleSubmit([Preferences.UNREAD_SCROLL_POSITION]);
                });
        };
        const unreadScrollPositionLabels = [
            {value: 0, label: localizeMessage('user.settings.advance.startFromLeftOff', 'Start me where I left off')},
            {value: 1, label: localizeMessage('user.settings.advance.startFromNewest', 'Start me at the newest message')},
        ];

        const inputs = [
            <ReactSelect
                key={unreadScrollPositionLabels[this.state.settings.unreadSelect].value}
                className='react-select settings-select advanced-select'
                classNamePrefix='react-select'
                id='limitVisibleGMsDMs'
                options={unreadScrollPositionLabels}
                clearable={false}
                onChange={(e) => handleUnreadSelectChange(e)}
                value={unreadScrollPositionLabels[this.state.settings.unreadSelect]}
                isSearchable={false}
                menuPortalTarget={document.body}
                styles={reactStyles}
            />,
        ];
        return (
            <RhsSettingsItem
                title={
                    <FormattedMessage
                        id='user.settings.advance.unreadScrollPositionTitle'
                        defaultMessage='Scroll position when viewing an unread channel'
                    />
                }
                inputs={inputs}
                messageDesc={
                    <FormattedMessage
                        id='user.settings.advance.unreadScrollPositionDesc'
                        defaultMessage='Choose your scroll position when you view an unread channel. Channels will always be marked as read when viewed.'
                    />
                }
                setting={Preferences.UNREAD_SCROLL_POSITION}
                submit={this.handleSubmit}
                saving={this.state.isSaving}
                server_error={this.state.serverError}
                isSelect={true}
            />
        );
    }

    render() {
        const serverError = this.state.serverError || null;
        let ctrlSendSection;
        const {ctrlSendTitle, ctrlSendDesc} = this.getCtrlSendText();

        const ctrlSendLabels = [
            {value: 0, label: localizeMessage('user.settings.advance.onForAllMessages', 'On for all messages')},
            {value: 1, label: localizeMessage('user.settings.advance.onForCode', 'On only for code blocks starting with ```')},
            {value: 2, label: localizeMessage('user.settings.advance.off', 'Off')},
        ];

        const handleSelectChange = (selected: ValueType<any>) => {
            const settings = this.state.settings;

            switch (selected.value) {
            case 0: {
                settings.send_on_ctrl_enter = 'true';
                settings.code_block_ctrl_enter = 'true';
                settings.enterSelect = 0;
                break;
            }
            case 1: {
                settings.send_on_ctrl_enter = 'false';
                settings.code_block_ctrl_enter = 'true';
                settings.enterSelect = 1;
                break;
            }
            case 2: {
                settings.send_on_ctrl_enter = 'false';
                settings.code_block_ctrl_enter = 'false';
                settings.enterSelect = 2;
                break;
            }
            }

            this.setState((prevState) => ({...prevState, ...settings}),
                () => {
                    this.handleSubmit(['send_on_ctrl_enter', 'code_block_ctrl_enter']);
                });
        };

        const inputs = [
            <ReactSelect
                key={ctrlSendLabels[this.state.settings.enterSelect].value}
                className='react-select settings-select advanced-select'
                classNamePrefix='react-select'
                id='limitVisibleGMsDMs'
                options={ctrlSendLabels}
                clearable={false}
                onChange={(e) => handleSelectChange(e)}
                value={ctrlSendLabels[this.state.settings.enterSelect]}
                isSearchable={false}
                menuPortalTarget={document.body}
                styles={reactStyles}
            />,
        ];
        ctrlSendSection = (
            <RhsSettingsItem
                title={
                    <FormattedMessage {...ctrlSendTitle}/>
                }
                inputs={inputs}
                messageDesc={<FormattedMessage {...ctrlSendDesc}/>}
                saving={this.state.isSaving}
                server_error={serverError}
                isSelect={true}
            />
        );

        const unreadScrollPositionSection = this.renderUnreadScrollPositionSection();

        return (
            <div id='displaySettings'>
                <div className='user-settings user-rhs-container container'>
                    <div className='divider-dark first'/>
                    {ctrlSendSection}
                </div>
            </div>
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
