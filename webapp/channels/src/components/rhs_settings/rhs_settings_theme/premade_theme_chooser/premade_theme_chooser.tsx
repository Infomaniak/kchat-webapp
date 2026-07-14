// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Preferences} from 'mattermost-redux/constants';
import type {Theme} from 'mattermost-redux/selectors/entities/preferences';

import SvgAutoThemeIcon from '../assets/SvgAutoIcon';
import SvgDarkThemeIcon from '../assets/SvgDarkIcon';
import SvgLightThemeIcon from '../assets/SvgLightIcon';

type Props = {
    theme: Theme;
    storedTheme: Theme | null;
    updateTheme: (theme: Theme) => void;
    allowedThemes: string[];
}

interface ThemeChoice {
    key: string;
    theme: Theme;
    icon: typeof SvgLightThemeIcon;
}

const PremadeThemeChooser = ({theme, storedTheme, updateTheme, allowedThemes = []}: Props) => {
    const activeKsuiteTheme = storedTheme?.ksuiteTheme ?? theme.ksuiteTheme;

    const autoThemeStub: Theme = {...Preferences.THEMES.ik, ksuiteTheme: 'auto'};

    const choices: ThemeChoice[] = [
        {
            key: 'light',
            theme: Preferences.THEMES.ik,
            icon: SvgLightThemeIcon,
        },
        {
            key: 'dark',
            theme: Preferences.THEMES.onyx,
            icon: SvgDarkThemeIcon,
        },
        {
            key: 'auto',
            theme: autoThemeStub,
            icon: SvgAutoThemeIcon,
        },
    ];

    const getThemeLabel = (choiceKey: string) => {
        switch (choiceKey) {
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
        default:
            return null;
        }
    };

    const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
    const visibleChoices = hasAllowedThemes ? choices.filter((c) => allowedThemes.includes(c.key)) : choices;

    return (
        <section className='row rhs-settings-section pb-8'>
            {visibleChoices.map((choice) => {
                const isActive = activeKsuiteTheme === choice.theme.ksuiteTheme;

                return (
                    <div
                        className='col-xs-6 col-sm-4 rhs-btns text-center'
                        key={choice.key}
                    >
                        <div
                            id={`rhsTheme${choice.key === 'auto' ? 'Auto' : choice.theme.type?.replace(' ', '')}`}
                            className={`rhs-custom-btn ${isActive ? 'active' : ''}`}
                            onClick={() => updateTheme({...choice.theme})}
                        >
                            <label>
                                <choice.icon/>
                                <div className='rhs-custom-btn-label'>
                                    {getThemeLabel(choice.key)}
                                </div>
                            </label>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default PremadeThemeChooser;
