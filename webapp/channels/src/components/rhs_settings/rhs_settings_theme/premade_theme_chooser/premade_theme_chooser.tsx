// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import type {Theme, ThemeKey} from 'mattermost-redux/selectors/entities/preferences';

import SvgAutoThemeIcon from '../assets/SvgAutoIcon';
import SvgDarkThemeIcon from '../assets/SvgDarkIcon';
import SvgLightThemeIcon from '../assets/SvgLightIcon';

type Props = {
    theme: Theme;
    storedTheme: Theme | null;
    updateTheme: (theme: Theme) => void;
    allowedThemes: string[];
}

const PremadeThemeChooser = ({theme, storedTheme, updateTheme, allowedThemes = []}: Props) => {
    const premadeThemes = [];
    const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
    const ikAllowedThemes = ['Infomaniak', 'Onyx', 'Auto'];

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
        case 'dark': {
            return (
                <FormattedMessage
                    id='user.settings.display.theme.themeDark'
                    defaultMessage='Dark theme'
                />
            );
        }
        case 'auto': {
            return (
                <FormattedMessage
                    id='user.settings.display.theme.themeAuto'
                    defaultMessage='Auto theme'
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
            if ((!storedTheme && premadeTheme.type === theme.type) || (storedTheme && storedTheme.type === premadeTheme.type)) {
                activeClass = 'active';
            }

            premadeThemes.push(
                <div
                    className='col-xs-6 col-sm-4 rhs-btns text-center'
                    key={premadeTheme.type}
                >
                    <div
                        id={`rhsTheme${premadeTheme.type?.replace(' ', '')}`}
                        className={`rhs-custom-btn ${activeClass}`}
                        onClick={() => updateTheme(premadeTheme)}
                    >
                        <label>
                            {(premadeTheme.type === 'Indigo' || premadeTheme.type === 'Onyx') && (<SvgDarkThemeIcon/>)}
                            {premadeTheme.type === 'Quartz' && (<SvgLightThemeIcon/>)}
                            {premadeTheme.type === 'Infomaniak' && (<SvgLightThemeIcon/>)}
                            {premadeTheme.type === 'Auto' && (<SvgAutoThemeIcon/>)}
                            <div className='rhs-custom-btn-label'>{
                                getThemeLabel(premadeTheme)
                            }</div>
                        </label>
                    </div>
                </div>,
            );
        }
    }

    return (
        <section
            className='row rhs-settings-section pb-8'
            key='txdfuyguhijok'
        >
            {premadeThemes}
        </section>
    );
};

export default PremadeThemeChooser;
