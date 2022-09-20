// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */
/* eslint-disable max-lines */
import React from 'react';
import {ToggleButton} from 'react-bootstrap';
import deepEqual from 'fast-deep-equal';

import {FormattedMessage} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';

import {Timezone} from 'timezones.json';

import {PreferenceType} from '@mattermost/types/preferences';
import {UserProfile, UserTimezone} from '@mattermost/types/users';

import {trackEvent} from 'actions/telemetry_actions';

import Constants from 'utils/constants';
import {getBrowserTimezone} from 'utils/timezone.jsx';

import * as I18n from 'i18n/i18n.jsx';
import {t} from 'utils/i18n';
import {localizeMessage} from 'utils/utils';
import ThemeSetting from 'components/user_settings/display/user_settings_theme';

import Toggle from '../../toggle';

import RhsSettingsItem from '../rhs_settings_item/rhs_settings_item';
import RhsShowUnreadsCategory from '../rhs_settings_sidebar/show_unreads_category/show_unreads_category';
import ReactSelect from 'react-select';

const Preferences = Constants.Preferences;

function getDisplayStateFromProps(props: Props) {
    return {
        militaryTime: props.militaryTime,
        teammateNameDisplay: props.teammateNameDisplay,
        availabilityStatusOnPosts: props.availabilityStatusOnPosts,
        channelDisplayMode: props.channelDisplayMode,
        messageDisplay: props.messageDisplay,
        colorizeUsernames: props.colorizeUsernames,
        collapseDisplay: props.collapseDisplay,
        collapsedReplyThreads: props.collapsedReplyThreads,
        linkPreviewDisplay: props.linkPreviewDisplay,
        oneClickReactionsOnPosts: props.oneClickReactionsOnPosts,
        clickToReply: props.clickToReply,
        showUnreadsCategory: props.showUnreadsCategory,
        unreadScrollPosition: props.unreadScrollPosition,
    };
}

type ChildOption = {
    id: string;
    message: string;
    value: string;
    display: string;
    moreId: string;
    moreMessage: string;
};

type Option = {
    value: string;
    radionButtonText: {
        id: string;
        message: string;
        moreId?: string;
        moreMessage?: string;
    };
    childOption?: ChildOption;
}

type SectionProps ={
    section: string;
    display: string;
    defaultDisplay: string;
    value: string | boolean;
    title: {
        id: string;
        message: string;
    };
    firstOption: Option;
    secondOption: Option;
    thirdOption?: Option;
    description: {
        id: string;
        message: string;
        values?: Record<string, React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode, React.ReactNode>>;
    };
    disabled?: boolean;
}

type SelectProps ={
    section: string;
    display: string;
    defaultDisplay: string;
    value: string | boolean;
    title: {
        id: string;
        message: string;
    };
    options: any;
    description?: {
        id: string;
        message: string;
        values?: Record<string, React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode, React.ReactNode>>;
    };
    disabled?: boolean;
}

type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    activeSection?: string;
    closeModal?: () => void;
    collapseModal?: () => void;
    setRequireConfirm?: () => void;
    setEnforceFocus?: () => void;
    timezones: Timezone[];
    userTimezone: UserTimezone;
    allowCustomThemes: boolean;
    enableLinkPreviews: boolean;
    defaultClientLocale: string;
    enableThemeSelection: boolean;
    configTeammateNameDisplay: string;
    currentUserTimezone: string;
    enableTimezone: boolean;
    shouldAutoUpdateTimezone: boolean | string;
    lockTeammateNameDisplay: boolean;
    militaryTime: string;
    teammateNameDisplay: string;
    availabilityStatusOnPosts: string;
    channelDisplayMode: string;
    messageDisplay: string;
    colorizeUsernames: string;
    collapseDisplay: string;
    collapsedReplyThreads: string;
    collapsedReplyThreadsAllowUserPreference: boolean;
    clickToReply: string;
    linkPreviewDisplay: string;
    oneClickReactionsOnPosts: string;
    emojiPickerEnabled: boolean;
    timezoneLabel: string;
    showUnreadsCategory: string;
    unreadScrollPosition: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        autoUpdateTimezone: (deviceTimezone: string) => void;
    };
}

type State = {
    [key: string]: any;
    isSaving: boolean;
    militaryTime: string;
    teammateNameDisplay: string;
    availabilityStatusOnPosts: string;
    channelDisplayMode: string;
    messageDisplay: string;
    colorizeUsernames: string;
    collapseDisplay: string;
    collapsedReplyThreads: string;
    linkPreviewDisplay: string;
    oneClickReactionsOnPosts: string;
    clickToReply: string;
    showUnreadsCategory: string;
    unreadScrollPosition: string;
    handleSubmit?: () => void;
    serverError?: string;
}

export default class RhsSettingsDisplay extends React.PureComponent<Props, State> {
    public prevSections: {
        theme: string;

        clock: string;
        linkpreview: string;
        message_display: string;
        channel_display_mode: string;
        languages: string;
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            ...getDisplayStateFromProps(props),
            isSaving: false,
        };

        this.prevSections = {
            theme: 'dummySectionName', // dummy value that should never match any section name
            clock: 'theme',
            linkpreview: 'clock',
            message_display: 'linkpreview',
            channel_display_mode: 'message_display',
            languages: 'channel_display_mode',
        };
    }

    componentDidMount() {
        const {actions, enableTimezone, shouldAutoUpdateTimezone} = this.props;

        if (enableTimezone && shouldAutoUpdateTimezone) {
            actions.autoUpdateTimezone(getBrowserTimezone());
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.teammateNameDisplay !== prevProps.teammateNameDisplay) {
            this.updateState();
        }
    }

    trackChangeIfNecessary(preference: PreferenceType, oldValue: any): void {
        const props = {
            field: 'display.' + preference.name,
            value: preference.value,
        };

        if (preference.value !== oldValue) {
            trackEvent('settings', 'user_settings_update', props);
        }
    }

    handleSubmit = async () => {
        const userId = this.props.user.id;

        const collapseDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLLAPSE_DISPLAY,
            value: this.state.collapseDisplay,
        };
        const availabilityStatusOnPostsPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.AVAILABILITY_STATUS_ON_POSTS,
            value: this.state.availabilityStatusOnPosts,
        };
        const teammateNameDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.NAME_NAME_FORMAT,
            value: this.state.teammateNameDisplay,
        };
        const channelDisplayModePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.CHANNEL_DISPLAY_MODE,
            value: this.state.channelDisplayMode,
        };
        const messageDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.MESSAGE_DISPLAY,
            value: this.state.messageDisplay,
        };
        const colorizeUsernamesPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLORIZE_USERNAMES,
            value: this.state.colorizeUsernames,
        };
        const collapsedReplyThreadsPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLLAPSED_REPLY_THREADS,
            value: this.state.collapsedReplyThreads,
        };
        const linkPreviewDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.LINK_PREVIEW_DISPLAY,
            value: this.state.linkPreviewDisplay,
        };
        const oneClickReactionsOnPostsPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.ONE_CLICK_REACTIONS_ENABLED,
            value: this.state.oneClickReactionsOnPosts,
        };
        const clickToReplyPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.CLICK_TO_REPLY,
            value: this.state.clickToReply,
        };

        const showUnreadPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: 'show_unread_section',
            value: this.state.showUnreadsCategory,
        };

        const unreadScrollPositionPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: Preferences.UNREAD_SCROLL_POSITION,
            value: this.state.unreadScrollPosition,
        };

        this.setState({isSaving: true});

        const preferences = [
            collapseDisplayPreference,
            linkPreviewDisplayPreference,
            oneClickReactionsOnPostsPreference,
            showUnreadPreference,
            channelDisplayModePreference,
            unreadScrollPositionPreference,
            messageDisplayPreference,
            collapsedReplyThreadsPreference,
            clickToReplyPreference,
            teammateNameDisplayPreference,
            availabilityStatusOnPostsPreference,
            colorizeUsernamesPreference,
        ];

        this.trackChangeIfNecessary(collapsedReplyThreadsPreference, this.props.collapsedReplyThreads);

        await this.props.actions.savePreferences(userId, preferences);

        this.updateSection('');
    }

    handleOnChange(display: {[key: string]: any}) {
        this.setState({...display}, () => {
            this.handleSubmit();
        });
    }

    updateSection = (section: string) => {
        this.updateState();
        this.props.updateSection(section);
    }

    updateState = () => {
        const newState = getDisplayStateFromProps(this.props);
        if (!deepEqual(newState, this.state)) {
            this.setState(newState);
        }

        this.setState({isSaving: false});
    }

    createSection(props: SectionProps) {
        const {
            section,
            display,
            value,
            title,
            firstOption,
            secondOption,
            thirdOption,
            description,
            disabled,
        } = props;
        let extraInfo = null;
        let submit: (() => Promise<void>) | null = this.handleSubmit;

        let moreColon;

        let thirdMessage;
        if (thirdOption) {
            thirdMessage = (
                <FormattedMessage
                    id={thirdOption.radionButtonText.id}
                    defaultMessage={thirdOption.radionButtonText.message}
                />
            );
        }

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
                values={description.values}
            />
        );

        const format = [false, false, false];
        let childOptionToShow: ChildOption | undefined;
        if (value === firstOption.value) {
            format[0] = true;
            childOptionToShow = firstOption.childOption;
        } else if (value === secondOption.value) {
            format[1] = true;
            childOptionToShow = secondOption.childOption;
        } else {
            format[2] = true;
            if (thirdOption) {
                childOptionToShow = thirdOption.childOption;
            }
        }

        const name = section + 'Format';
        const key = section + 'UserDisplay';

        const firstDisplay = {
            [display]: firstOption.value,
        };

        const secondDisplay = {
            [display]: secondOption.value,
        };

        let thirdSection;
        if (thirdOption && thirdMessage) {
            const thirdDisplay = {
                [display]: thirdOption.value,
            };

            thirdSection = (
                <div className='radio'>
                    <label>
                        <input
                            id={name + 'C'}
                            type='radio'
                            name={name}
                            checked={format[2]}
                            onChange={() => this.handleOnChange(thirdDisplay)}
                        />
                        {thirdMessage}
                    </label>
                    <br/>
                </div>
            );
        }

        let childOptionSection;
        if (childOptionToShow) {
            const childDisplay = childOptionToShow.display;
            childOptionSection = (
                <>
                    <div>
                        <FormattedMessage
                            id={childOptionToShow.id}
                            defaultMessage={childOptionToShow.message}
                        />
                        {moreColon}
                        <span className='font-weight--normal'>
                            <FormattedMessage
                                id={childOptionToShow.moreId}
                                defaultMessage={childOptionToShow.moreMessage}
                            />
                        </span>
                    </div>
                    <Toggle
                        id={name + 'childOption'}
                        onToggle={() => {
                            this.handleOnChange({[childDisplay]: childOptionToShow?.value === 'false' ? 'true' : 'false'});
                        }}
                        toggled={childOptionToShow.value === 'true'}
                    />
                </>
            );
        }

        let inputs = [
            <>
                <Toggle
                    id={name + 'A'}
                    onToggle={() => this.handleOnChange(format[0] ? secondDisplay : firstDisplay)}
                    toggled={Boolean(format[0])}

                />
            </>,

        ];

        if (display === 'teammateNameDisplay' && disabled) {
            extraInfo = (
                <span>
                    <FormattedMessage
                        id='user.settings.display.teammateNameDisplay'
                        defaultMessage='This field is handled through your System Administrator. If you want to change it, you need to do so through your System Administrator.'
                    />
                </span>
            );
            submit = null;
            inputs = [];
        }

        return (
            <RhsSettingsItem
                title={messageTitle}
                inputs={inputs}
                submit={submit}
                saving={this.state.isSaving}
                server_error={this.state.serverError}
                updateSection={this.updateSection}
                extraInfo={extraInfo}
                messageDesc={messageDesc}
                childOptionSection={childOptionSection}
            />
        );
    }

    createSelect(props: SelectProps) {
        const {
            section,
            display,
            value,
            title,
            options,
            description,
        } = props;

        const messageTitle = (
            <FormattedMessage
                id={title.id}
                defaultMessage={title.message}
            />
        );
        let messageDesc = '';
        if (description) {
            messageDesc = (
                <FormattedMessage
                    id={description.id}
                    defaultMessage={description.message}
                    values={description.values}
                />
            );
        }
        return (
            <RhsSettingsItem
                title={messageTitle}
                inputs={
                    <ReactSelect
                        className='react-select settings-select advanced-select'
                        classNamePrefix='react-select'
                        id={display}
                        options={options}
                        clearable={false}
                        onChange={(e) => this.handleOnChange({[display]: e.value})}
                        value={options.filter((opt: { value: string | boolean }) => opt.value === value)}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={reactStyles}
                    />
                }
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
            />
        );
    }

    render() {
        const collapseSection = this.createSection({
            section: 'collapse',
            display: 'collapseDisplay',
            value: this.state.collapseDisplay,
            defaultDisplay: 'false',
            title: {
                id: t('user.settings.display.collapseDisplay'),
                message: 'Default Appearance of Image Previews',
            },
            firstOption: {
                value: 'false',
                radionButtonText: {
                    id: t('user.settings.display.collapseOn'),
                    message: 'On',
                },
            },
            secondOption: {
                value: 'true',
                radionButtonText: {
                    id: t('user.settings.display.collapseOff'),
                    message: 'Off',
                },
            },
            description: {
                id: t('user.settings.display.collapseDesc'),
                message: 'Set whether previews of image links and image attachment thumbnails show as expanded or collapsed by default. This setting can also be controlled using the slash commands /expand and /collapse.',
            },
        });

        let linkPreviewSection = null;

        if (this.props.enableLinkPreviews) {
            linkPreviewSection = this.createSection({
                section: 'linkpreview',
                display: 'linkPreviewDisplay',
                value: this.state.linkPreviewDisplay,
                defaultDisplay: 'true',
                title: {
                    id: t('user.settings.display.linkPreviewDisplay'),
                    message: 'Website Link Previews',
                },
                firstOption: {
                    value: 'true',
                    radionButtonText: {
                        id: t('user.settings.display.linkPreviewOn'),
                        message: 'On',
                    },
                },
                secondOption: {
                    value: 'false',
                    radionButtonText: {
                        id: t('user.settings.display.linkPreviewOff'),
                        message: 'Off',
                    },
                },
                description: {
                    id: t('user.settings.display.linkPreviewDesc'),
                    message: 'When available, the first web link in a message will show a preview of the website content below the message.',
                },
            });
            this.prevSections.message_display = 'linkpreview';
        } else {
            this.prevSections.message_display = this.prevSections.linkpreview;
        }

        const messageDisplaySection = this.createSection({
            section: Preferences.MESSAGE_DISPLAY,
            display: 'messageDisplay',
            value: this.state.messageDisplay,
            defaultDisplay: Preferences.MESSAGE_DISPLAY_CLEAN,
            title: {
                id: t('user.settings.display.messageDisplayTitle'),
                message: 'Message Display',
            },
            firstOption: {
                value: Preferences.MESSAGE_DISPLAY_CLEAN,
                radionButtonText: {
                    id: t('user.settings.display.messageDisplayClean'),
                    message: 'Standard',
                    moreId: t('user.settings.display.messageDisplayCleanDes'),
                    moreMessage: 'Easy to scan and read.',
                },
            },
            secondOption: {
                value: Preferences.MESSAGE_DISPLAY_COMPACT,
                radionButtonText: {
                    id: t('user.settings.display.messageDisplayCompact'),
                    message: 'Compact',
                    moreId: t('user.settings.display.messageDisplayCompactDes'),
                    moreMessage: 'Fit as many messages on the screen as we can.',
                },
                childOption: {
                    id: t('user.settings.display.colorize'),
                    value: this.state.colorizeUsernames,
                    display: 'colorizeUsernames',
                    message: 'Colorize usernames',
                    moreId: t('user.settings.display.colorizeDes'),
                    moreMessage: 'Use colors to distinguish users in compact mode',
                },
            },
            description: {
                id: t('user.settings.display.messageDisplayDescription'),
                message: 'Select how messages in a channel should be displayed.',
            },
        });

        const channelDisplayModeSection = this.createSelect({
            section: Preferences.CHANNEL_DISPLAY_MODE,
            display: 'channelDisplayMode',
            value: this.state.channelDisplayMode,
            defaultDisplay: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            title: {
                id: t('user.settings.display.channelDisplayTitle'),
                message: 'Channel Display',
            },
            options: [
                {value: Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN, label: localizeMessage('user.settings.display.fullScreen', 'Full width')},
                {value: Preferences.CHANNEL_DISPLAY_MODE_CENTERED, label: localizeMessage('user.settings.display.fixedWidthCentered', 'Fixed width, centered')},
            ],
            description: {
                id: t('user.settings.display.channeldisplaymode'),
                message: 'Select the width of the center channel.',
            },
        });

        const UnreadScrollPositionSection = this.createSelect({
            section: Preferences.CHANNEL_DISPLAY_MODE,
            display: 'unreadScrollPosition',
            value: this.state.unreadScrollPosition,
            defaultDisplay: Preferences.UNREAD_SCROLL_POSITION,
            title: {
                id: t('user.settings.advance.unreadScrollPositionTitle'),
                message: 'Scroll position when viewing an unread channel',
            },
            options: [
                {value: Preferences.UNREAD_SCROLL_POSITION_START_FROM_LEFT, label: localizeMessage('user.settings.advance.startFromLeftOff', 'Start me where I left off')},
                {value: Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST, label: localizeMessage('user.settings.advance.startFromNewest', 'Start me at the newest message')},
            ],
        });

        const showUnreadSection = this.createSection({
            section: 'show_unread_section',
            display: 'showUnreadsCategory',
            value: this.state.showUnreadsCategory,
            defaultDisplay: 'true',
            title: {
                id: t('user.settings.sidebar.showUnreadsCategoryTitle'),
                message: 'Group unread channels separately',
            },
            firstOption: {
                value: 'true',
                radionButtonText: {
                    id: t('user.settings.display.fullScreen'),
                    message: 'Full width',
                },
            },
            secondOption: {
                value: 'false',
                radionButtonText: {
                    id: t('user.settings.display.fixedWidthCentered'),
                    message: 'Fixed width, centered',
                },
            },
            description: {
                id: t('user.settings.sidebar.showUnreadsCategoryDesc'),
                message: 'When enabled, all unread channels and direct messages will be grouped together in the sidebar.',
            },
        });

        let themeSection;
        if (this.props.enableThemeSelection) {
            themeSection = (
                <div>
                    <ThemeSetting
                        selected={this.props.activeSection === 'theme'}
                        updateSection={this.updateSection}
                        setRequireConfirm={this.props.setRequireConfirm}
                        setEnforceFocus={this.props.setEnforceFocus}
                        allowCustomThemes={this.props.allowCustomThemes}
                    />
                    <div className='divider-dark'/>
                </div>
            );
        }

        let oneClickReactionsOnPostsSection;
        if (this.props.emojiPickerEnabled) {
            oneClickReactionsOnPostsSection = this.createSection({
                section: Preferences.ONE_CLICK_REACTIONS_ENABLED,
                display: 'oneClickReactionsOnPosts',
                value: this.state.oneClickReactionsOnPosts,
                defaultDisplay: 'true',
                title: {
                    id: t('user.settings.display.oneClickReactionsOnPostsTitle'),
                    message: 'Quick reactions on messages',
                },
                firstOption: {
                    value: 'false',
                    radionButtonText: {
                        id: t('user.settings.sidebar.on'),
                        message: 'On',
                    },
                },
                secondOption: {
                    value: 'true',
                    radionButtonText: {
                        id: t('user.settings.sidebar.off'),
                        message: 'Off',
                    },
                },
                description: {
                    id: t('user.settings.display.oneClickReactionsOnPostsDescription'),
                    message: 'When enabled, you can react in one-click with recently used reactions when hovering over a message.',
                },
            });
        }

        return (
            <div id='displaySettings'>
                <div className='user-settings user-rhs-container container'>
                    <div className='divider-dark first'/>
                    {/*
                    {themeSection}
*/}
                    {collapseSection}
                    {linkPreviewSection}
                    {oneClickReactionsOnPostsSection}
                    {showUnreadSection}
{/* Compact mode
                    {messageDisplaySection}
*/}
                    {channelDisplayModeSection}
                    {UnreadScrollPositionSection}
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
