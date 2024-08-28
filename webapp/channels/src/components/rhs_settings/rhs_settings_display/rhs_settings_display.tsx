// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';
import isEqual from 'lodash/isEqual';
import type {ComponentProps} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import ReactSelect from 'react-select';
import type {Timezone} from 'timezones.json';

import type {PreferenceType} from '@mattermost/types/preferences';
import type {UserProfile, UserTimezone} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';

import {trackEvent} from 'actions/telemetry_actions';

import RhsLimitVisibleGMsDMs from 'components/rhs_settings/rhs_settings_display/limit_visible_gms_dms';
import RhsSettingsItem from 'components/rhs_settings/rhs_settings_item/rhs_settings_item';
import RhsThemeSetting from 'components/rhs_settings/rhs_settings_theme';
import Toggle from 'components/toggle';
import ManageTimezones from 'components/user_settings/display/manage_timezones';

import Constants from 'utils/constants';
import {t} from 'utils/i18n';
import {getBrowserTimezone} from 'utils/timezone';
import {localizeMessage} from 'utils/utils';

import SvgCompactIcon from '../rhs_settings_compact/assets/SvgCompactIcon';
import SvgNoCompactIcon from '../rhs_settings_compact/assets/SvgNoCompactIcon';

const Preferences = Constants.Preferences;

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

type CustomBtnSelectProps ={
    display?: string;
    defaultDisplay?: string;
    value: string | boolean;
    options: any;
    childOption?: ChildOption;
    description?: {
        id: string;
        message: string;
        values?: Record<string, React.ReactNode | PrimitiveType | FormatXMLElementFn<React.ReactNode, React.ReactNode>>;
    };
    disabled?: boolean;
    hasBottomBorder?: boolean;
}

type Props = {
    user: UserProfile;
    updateSection: (section: string) => void;
    activeSection?: string;
    closeModal?: () => void;
    collapseModal?: () => void;
    setRequireConfirm?: () => void;
    setEnforceFocus?: () => void;
    userTimezone: UserTimezone;
    timezones: Timezone[];
    timezone: UserTimezone;
    allowCustomThemes: boolean;
    enableLinkPreviews: boolean;
    defaultClientLocale: string;
    enableThemeSelection: boolean;
    configTeammateNameDisplay: string;
    currentUserTimezone: string;
    enableTimezone: boolean;
    shouldAutoUpdateTimezone: boolean | string;
    lockTeammateNameDisplay: boolean;
    teammateNameDisplay: string;
    availabilityStatusOnPosts: string;
    channelDisplayMode: string;
    messageDisplay: string;
    colorizeUsernames: string;
    collapseDisplay: string;
    linkPreviewDisplay: string;
    oneClickReactionsOnPosts: string;
    emojiPickerEnabled: boolean;
    timezoneLabel: string;
    showUnreadsCategory: string;
    unreadScrollPosition: string;
    militaryTime: string;
    lastActiveDisplay: string;
    lastActiveTimeEnabled: boolean;
    timezoneDisplay: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => void;
        autoUpdateTimezone: (deviceTimezone: string) => void;
        updateMe: (user: UserProfile) => Promise<ActionResult>;
    };
}

type State = {
    isSaving: boolean;
    teammateNameDisplay: string;
    availabilityStatusOnPosts: string;
    channelDisplayMode: string;
    messageDisplay: string;
    colorizeUsernames: string;
    collapseDisplay: string;
    linkPreviewDisplay: string;
    oneClickReactionsOnPosts: string;
    showUnreadsCategory: string;
    unreadScrollPosition: string;
    handleSubmit?: () => void;
    serverError?: string;
    militaryTime: string;
    lastActiveDisplay: string;
    timezoneDisplay: string;
    timezone: UserTimezone;
}

export default class RhsSettingsDisplay extends React.PureComponent<Props, State> {
    static getDerivedStateFromProps(props: Props) {
        return {
            lastActiveDisplay: props.lastActiveDisplay,
            militaryTime: props.militaryTime,
            teammateNameDisplay: props.teammateNameDisplay,
            availabilityStatusOnPosts: props.availabilityStatusOnPosts,
            channelDisplayMode: props.channelDisplayMode ?? Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            messageDisplay: props.messageDisplay ? props.messageDisplay : Preferences.MESSAGE_DISPLAY_CLEAN,
            colorizeUsernames: props.colorizeUsernames ? props.colorizeUsernames : 'true',
            collapseDisplay: props.collapseDisplay ? props.collapseDisplay : 'false',
            linkPreviewDisplay: props.linkPreviewDisplay ? props.linkPreviewDisplay : 'true',
            oneClickReactionsOnPosts: props.oneClickReactionsOnPosts ? props.oneClickReactionsOnPosts : 'true',
            showUnreadsCategory: props.showUnreadsCategory ? props.showUnreadsCategory : 'true',
            unreadScrollPosition: props.unreadScrollPosition ? props.unreadScrollPosition : Preferences.UNREAD_SCROLL_POSITION,
            timezoneDisplay: props.timezoneDisplay ? props.timezoneDisplay : 'true',
            timezone: props.timezone,
        };
    }

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
            lastActiveDisplay: props.lastActiveDisplay,
            militaryTime: props.militaryTime,
            teammateNameDisplay: props.teammateNameDisplay,
            availabilityStatusOnPosts: props.availabilityStatusOnPosts,
            channelDisplayMode: props.channelDisplayMode ? props.channelDisplayMode : Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
            messageDisplay: props.messageDisplay ? props.messageDisplay : Preferences.MESSAGE_DISPLAY_CLEAN,
            colorizeUsernames: props.colorizeUsernames ? props.colorizeUsernames : 'true',
            collapseDisplay: props.collapseDisplay ? props.collapseDisplay : 'false',
            linkPreviewDisplay: props.linkPreviewDisplay ? props.linkPreviewDisplay : 'true',
            oneClickReactionsOnPosts: props.oneClickReactionsOnPosts ? props.oneClickReactionsOnPosts : 'true',
            showUnreadsCategory: props.showUnreadsCategory ? props.showUnreadsCategory : 'true',
            unreadScrollPosition: props.unreadScrollPosition ? props.unreadScrollPosition : Preferences.UNREAD_SCROLL_POSITION,
            isSaving: false,
            timezoneDisplay: props.timezoneDisplay ? props.timezoneDisplay : 'true',
            timezone: props.timezone,
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

    trackChangeIfNecessary(preference: PreferenceType, oldValue: any): void {
        const props = {
            field: 'display.' + preference.name,
            value: preference.value,
        };

        if (preference.value !== oldValue) {
            trackEvent('settings', 'user_settings_update', props);
        }
    }

    /**
     * Called every time an option changes.
     * TODO: simplify the options batching since only 1 option gets updated at a time.
     */
    handleSubmit = async (newSettingsState: State) => {
        const {user, actions} = this.props;
        const userId = user.id;

        // User preferences patch user and don't need to update preferences
        if (newSettingsState.lastActiveDisplay !== this.props.lastActiveDisplay ||
            !isEqual(newSettingsState.timezone, this.props.timezone)) {
            const updatedUser = {
                ...user,
                timezone: newSettingsState.timezone,
                props: {
                    ...user.props,
                    show_last_active: newSettingsState.lastActiveDisplay,
                },
            };

            actions.updateMe(updatedUser).
                then((res) => {
                    if ('data' in res) {
                        this.props.updateSection('');
                    } else if ('error' in res) {
                        const {error} = res;
                        let serverError;
                        if (error instanceof Error) {
                            serverError = error.message;
                        } else {
                            serverError = error as string;
                        }
                        this.setState({serverError, isSaving: false});
                    }
                });

            this.updateSection('');

            this.setState({isSaving: false});
            return;
        }

        const collapseDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLLAPSE_DISPLAY,
            value: newSettingsState.collapseDisplay,
        };
        const availabilityStatusOnPostsPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.AVAILABILITY_STATUS_ON_POSTS,
            value: newSettingsState.availabilityStatusOnPosts,
        };
        const teammateNameDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.NAME_NAME_FORMAT,
            value: newSettingsState.teammateNameDisplay,
        };
        const channelDisplayModePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.CHANNEL_DISPLAY_MODE,
            value: newSettingsState.channelDisplayMode,
        };
        const messageDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.MESSAGE_DISPLAY,
            value: newSettingsState.messageDisplay,
        };
        const colorizeUsernamesPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.COLORIZE_USERNAMES,
            value: newSettingsState.colorizeUsernames,
        };
        const linkPreviewDisplayPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.LINK_PREVIEW_DISPLAY,
            value: newSettingsState.linkPreviewDisplay,
        };
        const oneClickReactionsOnPostsPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.ONE_CLICK_REACTIONS_ENABLED,
            value: newSettingsState.oneClickReactionsOnPosts,
        };

        const showUnreadPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: 'show_unread_section',
            value: newSettingsState.showUnreadsCategory,
        };

        const unreadScrollPositionPreference = {
            user_id: userId,
            category: Preferences.CATEGORY_ADVANCED_SETTINGS,
            name: Preferences.UNREAD_SCROLL_POSITION,
            value: newSettingsState.unreadScrollPosition,
        };

        const timePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.USE_MILITARY_TIME,
            value: newSettingsState.militaryTime,
        };

        const timezonePreference = {
            user_id: userId,
            category: Preferences.CATEGORY_DISPLAY_SETTINGS,
            name: Preferences.TIMEZONE_DISPLAY,
            value: newSettingsState.timezoneDisplay,
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
            teammateNameDisplayPreference,
            availabilityStatusOnPostsPreference,
            colorizeUsernamesPreference,
            timePreference,
            timezonePreference,
        ];

        await this.props.actions.savePreferences(userId, preferences);

        this.updateSection('');

        this.setState({isSaving: false});
    };

    handleOnChange(display: Partial<State>) {
        this.handleSubmit({...this.state, ...display});
    }
    handleOnTimezoneChange: ComponentProps<typeof ManageTimezones>['onChange'] = (timezone) => {
        this.handleOnChange({timezone: {
            useAutomaticTimezone: timezone.useAutomaticTimezone.toString(),
            manualTimezone: timezone.useAutomaticTimezone ? timezone.automaticTimezone : timezone.manualTimezone,
            automaticTimezone: timezone.useAutomaticTimezone ? timezone.automaticTimezone : timezone.manualTimezone,
        }});
    };

    updateSection = (section: string) => {
        this.props.updateSection(section);
    };

    updateState = () => {
        this.setState({isSaving: false});
    };

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
        } = props;
        const extraInfo = null;

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

        const firstDisplay = {
            [display]: firstOption.value,
        };

        const secondDisplay = {
            [display]: secondOption.value,
        };

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

        const inputs = (
            <Toggle
                id={name + 'A'}
                onToggle={() => this.handleOnChange(format[0] ? secondDisplay : firstDisplay)}
                toggled={Boolean(format[0])}

            />
        );

        return (
            <RhsSettingsItem
                key={display}
                title={messageTitle}
                inputs={inputs}
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
            display,
            value,
            title,
            options,
        } = props;

        const messageTitle = (
            <FormattedMessage
                id={title.id}
                defaultMessage={title.message}
            />
        );

        return (
            <RhsSettingsItem
                key={display}
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
                        styles={reactStyles}
                    />
                }
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
            />
        );
    }

    createCustomBtnSelect(props: CustomBtnSelectProps) {
        const {
            display,
            value,
            options,
            hasBottomBorder,
        } = props;

        const inputs: JSX.Element[] = [];

        const col = (12 / options.length);

        let childOptionSection;

        options.forEach((option: CustomBtnSelectProps, key: number) => {
            if (option.childOption && option.value === value) {
                const childDisplay = option.childOption.display;
                childOptionSection = (
                    <div
                        className={'col-sm-12 title-toggle pt-4'}
                    >
                        <h5
                            id='settingTitle'
                            className='settings-title'
                        >
                            <FormattedMessage
                                id={option.childOption.moreId}
                                defaultMessage={option.childOption.moreMessage}
                            />
                        </h5>

                        <Toggle
                            id={name + 'childOption'}
                            onToggle={() => {
                                this.handleOnChange({[childDisplay]: option.childOption?.value === 'false' ? 'true' : 'false'});
                            }}
                            toggled={option.childOption.value === 'true'}
                        />
                    </div>
                );
            }

            let activeClass = '';
            if (value === option.value) {
                activeClass = 'active';
            }

            inputs.push(
                <div
                    className={`col-xs-6 col-sm-${col} rhs-btns text-center`}
                    key={key}
                >
                    <div
                        id={`rhsCustomBtnSelect${key}`}
                        className={`rhs-custom-btn ${activeClass}`}
                        onClick={() => this.handleOnChange({[display]: option.value})}
                    >
                        <label>
                            {option.icon}
                            <div className='rhs-custom-btn-label'>{option.label}</div>
                        </label>
                    </div>
                </div>,
            );
        });

        return (
            <RhsSettingsItem
                key={display}
                inputs={inputs}
                saving={this.state.isSaving}
                updateSection={this.props.updateSection}
                isCustomBtn={true}
                childOptionSection={childOptionSection}
                containerStyle={hasBottomBorder ? 'rhs-custom-bb' : ''}
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

        const messageDisplaySection = this.createCustomBtnSelect({
            display: 'messageDisplay',
            value: this.state.messageDisplay,
            defaultDisplay: Preferences.MESSAGE_DISPLAY_CLEAN,
            options: [
                {
                    value: Preferences.MESSAGE_DISPLAY_CLEAN,
                    label: localizeMessage('user.settings.display.messageDisplayClean', 'Standard'),
                    icon: <SvgNoCompactIcon/>},
                {
                    value: Preferences.MESSAGE_DISPLAY_COMPACT,
                    label: localizeMessage('user.settings.display.messageDisplayCompact', 'Compact'),
                    icon: <SvgCompactIcon/>,
                    childOption: {
                        id: t('user.settings.display.colorize'),
                        value: this.state.colorizeUsernames,
                        display: 'colorizeUsernames',
                        message: 'Colorize usernames',
                        moreId: t('user.settings.display.colorizeDes'),
                        moreMessage: 'Use colors to distinguish users in compact mode',
                    },
                },
            ],

            description: {
                id: t('user.settings.display.messageDisplayDescription'),
                message: 'Select how messages in a channel should be displayed.',
            },
            hasBottomBorder: true,
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
                <RhsThemeSetting
                    selected={this.props.activeSection === 'theme'}
                    updateSection={this.updateSection}
                    setRequireConfirm={this.props.setRequireConfirm}
                    setEnforceFocus={this.props.setEnforceFocus}
                    allowCustomThemes={this.props.allowCustomThemes}
                />
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
                    value: 'true',
                    radionButtonText: {
                        id: t('user.settings.sidebar.on'),
                        message: 'On',
                    },
                },
                secondOption: {
                    value: 'false',
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

        const clockSection = this.createSelect({
            section: 'clock',
            display: 'militaryTime',
            value: this.state.militaryTime,
            defaultDisplay: 'false',
            title: {
                id: t('user.settings.display.clockDisplay'),
                message: 'Clock Display',
            },
            options: [
                {value: 'false', label: localizeMessage('user.settings.display.normalClock', '12-hour clock (example: 4:00 PM)')},
                {value: 'true', label: localizeMessage('user.settings.display.militaryClock', '24-hour clock (example: 16:00)')},
            ],
            description: {
                id: t('user.settings.display.preferTime'),
                message: 'Select how you prefer time displayed. When disabled, displays a clock ranging from 0 to 24 hours (e.g. 16:00)',
            },
        });

        const teammateNameDisplaySection = this.createSelect({
            section: Preferences.NAME_NAME_FORMAT,
            display: 'teammateNameDisplay',
            value: this.props.lockTeammateNameDisplay ? this.props.configTeammateNameDisplay : this.state.teammateNameDisplay,
            defaultDisplay: this.props.configTeammateNameDisplay,
            title: {
                id: t('user.settings.display.teammateNameDisplayTitle'),
                message: 'Teammate Name Display',
            },
            options: [
                {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME, label: localizeMessage('user.settings.display.teammateNameDisplayUsername', 'Show username')},

                // {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_NICKNAME_FULLNAME, label: localizeMessage('user.settings.display.teammateNameDisplayNicknameFullname', 'Show nickname if one exists, otherwise show first and last name')},
                {value: Constants.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME, label: localizeMessage('user.settings.display.teammateNameDisplayFullname', 'Show first and last name')},
            ],
            description: {
                id: t('user.settings.display.teammateNameDisplayDescription'),
                message: 'Set how to display other user\'s names in posts and the Direct Messages list.',
            },
            disabled: this.props.lockTeammateNameDisplay,
        });

        let lastActiveSection = null;

        if (this.props.lastActiveTimeEnabled) {
            lastActiveSection = this.createSection({
                section: 'lastactive',
                display: 'lastActiveDisplay',
                value: this.state.lastActiveDisplay,
                defaultDisplay: 'true',
                title: {
                    id: t('user.settings.display.lastActiveDisplay'),
                    message: 'Share last active time',
                },
                firstOption: {
                    value: 'true',
                    radionButtonText: {
                        id: t('user.settings.display.lastActiveOn'),
                        message: 'On',
                    },
                },
                secondOption: {
                    value: 'false',
                    radionButtonText: {
                        id: t('user.settings.display.lastActiveOff'),
                        message: 'Off',
                    },
                },
                description: {
                    id: t('user.settings.display.lastActiveDesc'),
                    message: 'When enabled, other users will see when you were last active.',
                },
            });
        }

        let timezoneSelection;
        if (this.props.enableTimezone && !this.props.shouldAutoUpdateTimezone) {
            timezoneSelection = (
                <>
                    <label htmlFor='user.settings.display.timezone'>
                        <FormattedMessage
                            id='user.settings.display.timezone'
                            defaultMessage='Timezone'
                        />
                    </label>
                    <ManageTimezones
                        user={this.props.user}
                        updateSection={this.updateSection}
                        onChange={this.handleOnTimezoneChange}
                        compact={true}
                        {...this.props.timezone}
                    />
                </>
            );
        }

        return (
            <div id='displaySettings'>
                <div className='user-settings user-rhs-container container'>
                    <div className='divider-dark first'/>
                    {themeSection}
                    {messageDisplaySection}
                    {timezoneSelection}
                    {collapseSection}
                    {linkPreviewSection}
                    {oneClickReactionsOnPostsSection}
                    {showUnreadSection}
                    {lastActiveSection}
                    {channelDisplayModeSection}
                    {UnreadScrollPositionSection}
                    {clockSection}
                    {teammateNameDisplaySection}
                    <RhsLimitVisibleGMsDMs/>
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
