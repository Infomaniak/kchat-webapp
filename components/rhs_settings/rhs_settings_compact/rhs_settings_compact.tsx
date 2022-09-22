// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {PreferenceType} from '@mattermost/types/preferences';
import RhsSettingsItem from 'components/rhs_settings/rhs_settings_item/rhs_settings_item';
import Toggle from 'components/toggle';
import {t} from '../../../utils/i18n';

type Props = {
    active: boolean;
    currentUserId?: string;
    savePreferences?: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    messageDisplay: string;
    colorizeUsernames: string;
}

type State = {
    active: boolean;
    checked: boolean;
    isSaving: boolean;
}

export default class RhsSettingsCompact extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            active: false,
            checked: false,
            isSaving: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.active !== state.active) {
            if (props.active && !state.active) {
                return {
                    checked: props.messageDisplay,
                    active: props.active,
                };
            }

            return {
                active: props.active,
            };
        }

        return null;
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

    handleOnChange(checked: any) {
        this.setState(checked, () => {
            this.handleSubmit();
        });
    }

    handleSubmit = async () => {
        this.setState({isSaving: true});

        await this.props.savePreferences(this.props.currentUserId, [{
            user_id: this.props.currentUserId,
            category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
            name: Preferences.SHOW_UNREAD_SECTION,
            value: this.state.checked.toString(),
        }]);

        this.setState({isSaving: false});

        this.props.updateSection('');
    }

    render() {
        const title = (
            <FormattedMessage
                id='user.settings.sidebar.showUnreadsCategoryTitle'
                defaultMessage='Group unread channels separately'
            />
        );

        return (
            <section className='row rhs-settings-section'>
                <div className='clearfix'>
                    <div
                        className='col-xs-6 col-sm-4 rhs-compact text-center'
                        key={'rhs-compact-key' + k}
                    >
                        <div
                            className={`rhs-compact-btn ${activeClass}`}
                            onClick={() => updateCompact(premadeTheme)}
                        >
                            <label>
                                {(premadeTheme.type === 'Indigo' || premadeTheme.type === 'Onyx') && (<SvgDarkThemeIcon/>)}
                                {premadeTheme.type === 'Quartz' && (<SvgLightThemeIcon/>)}
                                {premadeTheme.type === 'Infomaniak' && (<SvgMediumThemeIcon/>)}
                                <div className='rhs-compact-label'>{
                                    getThemeLabel(premadeTheme)
                                }</div>
                            </label>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
