// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {Constants} from 'utils/constants';
import {applyTheme} from 'utils/utils';

import PremadeThemeChooser from './premade_theme_chooser';

type Props = {
    currentTeamId: string;
    theme: Theme;
    selected: boolean;
    updateSection: (section: string) => void;
    setRequireConfirm?: (requireConfirm: boolean) => void;
    setEnforceFocus?: (enforceFocus: boolean) => void;
    allowCustomThemes: boolean;
    actions: {
        saveTheme: (teamId: string, theme: Theme) => void;
        deleteTeamSpecificThemes: () => void;
    };
};

type State = {
    isSaving: boolean;
    type: string;
    serverError: string;
    theme: Theme;
};

export default class RhsThemeSetting extends React.PureComponent<Props, State> {
    originalTheme: Theme;
    constructor(props: Props) {
        super(props);

        this.state = {
            ...this.getStateFromProps(props),
            isSaving: false,
            serverError: '',
        };

        this.originalTheme = Object.assign({}, this.state.theme);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.selected && !this.props.selected) {
            this.resetFields();
        }
    }

    componentWillUnmount() {
        if (this.props.selected) {
            applyTheme(this.props.theme);
        }
    }

    getStateFromProps(props = this.props): State {
        const theme = {...props.theme};
        if (!theme.codeTheme) {
            theme.codeTheme = Constants.DEFAULT_CODE_THEME;
        }

        return {
            theme,
            type: theme.type || 'premade',
            serverError: '',
            isSaving: false,
        };
    }

    submitTheme = async (): Promise<void> => {
        const teamId = this.props.currentTeamId;

        this.setState({isSaving: true});
        await this.props.actions.saveTheme(teamId, this.state.theme);

        this.props.setRequireConfirm?.(false);
        this.originalTheme = Object.assign({}, this.state.theme);
        this.props.updateSection('');
        this.setState({isSaving: false});
    };

    updateTheme = (theme: Theme): void => {
        let themeChanged = this.state.theme.length === theme.length;
        if (!themeChanged) {
            for (const field in theme) {
                if (theme.hasOwnProperty(field)) {
                    if (this.state.theme[field] !== theme[field]) {
                        themeChanged = true;
                        break;
                    }
                }
            }
        }

        this.props.setRequireConfirm?.(themeChanged);

        this.setState({theme}, () => {
            this.submitTheme();
        });
        applyTheme(theme);
    };


    resetFields = (): void => {
        const state = this.getStateFromProps();
        state.serverError = '';
        this.setState(state);

        applyTheme(state.theme);

        this.props.setRequireConfirm?.(false);
    };

    handleUpdateSection = (section: string): void => this.props.updateSection(section);

    render() {
        return (
            <PremadeThemeChooser
                theme={this.state.theme}
                updateTheme={this.updateTheme}
            />
        );
    }
}
