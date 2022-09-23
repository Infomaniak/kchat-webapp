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
