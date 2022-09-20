// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Preferences} from 'mattermost-redux/constants';
import {Theme, ThemeKey} from 'mattermost-redux/selectors/entities/preferences';

import {toTitleCase} from 'utils/utils';
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

    for (const k in Preferences.THEMES) {
        if (Preferences.THEMES.hasOwnProperty(k)) {
            if (hasAllowedThemes && allowedThemes.indexOf(k) < 0) {
                continue;
            }

            const premadeTheme: Theme = Object.assign({}, Preferences.THEMES[k as ThemeKey]);

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
                            {premadeTheme.type === 'Indigo' && (<SvgDarkThemeIcon/>)}
                            {premadeTheme.type === 'Quartz' && (<SvgLightThemeIcon/>)}
                            {premadeTheme.type === 'Infomaniak' && (<SvgMediumThemeIcon/>)}
                            <div className='rhs-theme-label'>{toTitleCase(premadeTheme.type || '')}</div>
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
