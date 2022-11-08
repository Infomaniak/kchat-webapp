// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import ReactSelect, {ValueType} from 'react-select';

import Constants, {Preferences} from 'utils/constants';
import {t} from 'utils/i18n';
import {isMac, localizeMessage} from 'utils/utils';

import {UserProfile} from '@mattermost/types/users';
import {PreferenceType} from '@mattermost/types/preferences';

import {ActionResult} from 'mattermost-redux/types/actions';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';
import KeyboardShortcutSequence, {KEYBOARD_SHORTCUTS} from '../../keyboard_shortcuts/keyboard_shortcuts_sequence';
import * as Utils from '../../../utils/utils';

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
    sendOnCtrlEnter: string;
    codeBlockOnCtrlEnter: string;
    formatting: string;
    joinLeave: string;
    unreadScrollPosition: string;
    updateSection: (section?: string) => void;
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

    isLinux = Utils.isLinux();

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
                containerStyle='rhs-custom-bb'
            />
        );

        return (
            <div id='displaySettings'>
                <div className='user-settings user-rhs-container container'>
                    <div className='divider-dark first'/>
                    {ctrlSendSection}
                    <div className='rhs-settings-section rhs-custom-bb'>
                        <div>
                            <h5 className='section-title mb-8'><strong>{localizeMessage('shortcuts.nav.header', 'Navigation')}</strong></h5>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navPrev}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navNext}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navUnreadPrev}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navUnreadNext}/>
                            {!this.isLinux && <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavPrev}/>}
                            {!this.isLinux && <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavNext}/>}
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.teamNavSwitcher}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navSwitcher}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navDMMenu}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navSettings}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navMentions}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navFocusCenter}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navOpenCloseSidebar}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navExpandSidebar}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.navOpenChannelInfo}/>
                        </div>
                    </div>
                    <div className='rhs-settings-section rhs-custom-bb'>
                        <div>
                            <h5 className='section-title mb-8'><strong>{localizeMessage('shortcuts.msgs.header', 'Messages')}</strong></h5>
                            <h5 className='section-title mb-4'><strong>{localizeMessage('shortcuts.msgs.input.header', 'Works inside an empty input field')}</strong></h5>
                            <div className='subsection mt-4'>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgEdit}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReply}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgLastReaction}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkAllAsRead}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReprintPrev}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgReprintNext}/>
                            </div>
                            <h5 className='section-title mb-4 mt-8'><strong>{localizeMessage('shortcuts.msgs.comp.header', 'Autocomplete')}</strong></h5>
                            <div className='subsection mt-4'>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompUsername}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompChannel}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgCompEmoji}/>
                            </div>
                            <h5 className='section-title mb-4 mt-8'><strong>{localizeMessage('shortcuts.msgs.markdown.header', 'Formatting')}</strong></h5>
                            <div className='subsection mt-4'>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownBold}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownItalic}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgMarkdownLink}/>
                            </div>
                            <h5 className='section-title mb-4 mt-8'><strong>{localizeMessage('shortcuts.msgs.search.header', 'Searching')}</strong></h5>
                            <div className='subsection mt-4'>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.msgSearchChannel}/>
                            </div>
                        </div>
                    </div>
                    <div className='rhs-settings-section mb-8'>
                        <div>
                            <h5 className='section-title mb-4'><strong>{localizeMessage('shortcuts.files.header', 'Files')}</strong></h5>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.filesUpload}/>
                        </div>
                        <div className='section--lower'>
                            <h5 className='section-title mb-4 mt-8'><strong>{localizeMessage('shortcuts.browser.header', 'Built-in Browser Commands')}</strong></h5>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserChannelPrev}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserChannelNext}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserFontIncrease}/>
                            <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserFontDecrease}/>
                            <h5 className='section-title mb-4 mt-8'><strong>{localizeMessage('shortcuts.browser.input.header', 'Works inside an input field')}</strong></h5>
                            <div className='subsection'>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserHighlightPrev}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserHighlightNext}/>
                                <KeyboardShortcutSequence shortcut={KEYBOARD_SHORTCUTS.browserNewline}/>
                            </div>
                        </div>
                    </div>
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
