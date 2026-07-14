// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Preferences} from 'mattermost-redux/constants';
import type {Theme} from 'mattermost-redux/selectors/entities/preferences';
import {changeOpacity} from 'mattermost-redux/utils/theme_utils';

import {toTitleCase} from 'utils/utils';

import ThemeThumbnail from '../theme_thumbnail';

type Props = {
    theme: Theme;
    updateTheme: (theme: Theme) => void;
    allowedThemes: string[];
}

interface ThemeChoice {
    key: string;
    themeKey: string;
    theme: Theme;
}

const PremadeThemeChooser = ({theme, updateTheme, allowedThemes = []}: Props) => {
    const choices: ThemeChoice[] = [
        {key: 'ik', themeKey: 'ik', theme: Preferences.THEMES.ik},
        {key: 'onyx', themeKey: 'onyx', theme: Preferences.THEMES.onyx},
        {
            key: 'auto',
            themeKey: 'ik',
            theme: {...Preferences.THEMES.ik, ksuiteTheme: 'auto'},
        },
    ];

    const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
    const visibleChoices = hasAllowedThemes ? choices.filter((c) => allowedThemes.includes(c.key) || (c.key === 'auto' && allowedThemes.includes('quartz'))) : choices;

    return (
        <div
            id='premadeThemesSection'
            className='row appearance-section'
            aria-labelledby='standardThemes'
        >
            <div className='clearfix'>
                {visibleChoices.map((choice) => {
                    const premadeTheme = choice.theme;
                    const isActive = premadeTheme.ksuiteTheme === theme.ksuiteTheme;

                    return (
                        <div
                            className='col-xs-6 col-sm-3 premade-themes'
                            key={'premade-theme-key' + choice.key}
                        >
                            <button
                                id={`premadeTheme${choice.key === 'auto' ? 'Auto' : premadeTheme.type?.replace(' ', '')}`}
                                className={`premadeThemeButton ${isActive ? 'active' : ''}`}
                                onClick={() => updateTheme(premadeTheme)}
                            >
                                <label>
                                    <ThemeThumbnail
                                        themeKey={choice.themeKey}
                                        themeName={premadeTheme.type}
                                        sidebarBg={premadeTheme.sidebarBg}
                                        sidebarText={changeOpacity(premadeTheme.sidebarText, 0.48)}
                                        sidebarUnreadText={premadeTheme.sidebarUnreadText}
                                        onlineIndicator={premadeTheme.onlineIndicator}
                                        awayIndicator={premadeTheme.awayIndicator}
                                        dndIndicator={premadeTheme.dndIndicator}
                                        centerChannelColor={changeOpacity(premadeTheme.centerChannelColor, 0.16)}
                                        centerChannelBg={premadeTheme.centerChannelBg}
                                        newMessageSeparator={premadeTheme.newMessageSeparator}
                                        buttonBg={premadeTheme.buttonBg}
                                    />
                                    <div className='theme-label'>{toTitleCase(premadeTheme.type || '')}</div>
                                </label>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PremadeThemeChooser;
