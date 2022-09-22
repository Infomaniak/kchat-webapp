// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import {Theme, ThemeKey} from 'mattermost-redux/selectors/entities/preferences';

import SvgDarkThemeIcon from '../assets/SvgDarkIcon';
import SvgMediumThemeIcon from '../assets/SvgMediumIcon';
import SvgLightThemeIcon from '../assets/SvgLightIcon';

type Props = {
    theme: Theme;
    updateTheme: (theme: Theme) => void;
    allowedThemes: string[];
}

const PremadeThemeChooser = ({theme, updateTheme, allowedThemes = []}: Props) => {
    const premadeThemes = [];
    const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
    const ikAllowedThemes = ['Quartz', 'Infomaniak', 'Onyx'];

    // eslint-disable-next-line consistent-return
    const getThemeLabel = (theme: Theme) => {
        switch (theme.ikType) {
        case 'light': {
            return (
                <FormattedMessage
                    id='user.settings.display.theme.themeLight'
                    defaultMessage='Light theme'
                />
            );
        }
        case 'medium': {
            return (
                <FormattedMessage
                    id='user.settings.display.theme.themeMedium'
                    defaultMessage='Medium theme'
                />
            );
        }
        case 'dark': {
            return (
                <FormattedMessage
                    id='user.settings.display.theme.themeDark'
                    defaultMessage='Dark theme'
                />
            );
        }
        }
    };

    for (const k in Preferences.THEMES) {
        if (Preferences.THEMES.hasOwnProperty(k)) {
            if ((hasAllowedThemes && allowedThemes.indexOf(k) < 0)) {
                continue;
            }

            const premadeTheme: Theme = Object.assign({}, Preferences.THEMES[k as ThemeKey]);

            if (!ikAllowedThemes.includes(premadeTheme.type)) {
                continue;
            }

            let activeClass = '';
            if (premadeTheme.type === theme.type) {
                activeClass = 'active';
            }

            premadeThemes.push(
                <div
                    className='col-xs-6 col-sm-4 rhs-theme text-center'
                    key={'rhs-theme-key' + k}
                >
                    <div
                        id={`rhsTheme${premadeTheme.type?.replace(' ', '')}`}
                        className={`rhs-theme-btn ${activeClass}`}
                        onClick={() => updateTheme(premadeTheme)}
                    >
                        <label>
                            {(premadeTheme.type === 'Indigo' || premadeTheme.type === 'Onyx') && (<SvgDarkThemeIcon/>)}
                            {premadeTheme.type === 'Quartz' && (<SvgLightThemeIcon/>)}
                            {premadeTheme.type === 'Infomaniak' && (<SvgMediumThemeIcon/>)}
                            <div className='rhs-theme-label'>{
                                getThemeLabel(premadeTheme)
                            }</div>
                        </label>
                    </div>
                </div>,
            );
        }
    }

    return (
        <section className='row rhs-settings-section'>
            <div className='clearfix'>
                {premadeThemes}
            </div>
        </section>
    );
};

export default PremadeThemeChooser;
