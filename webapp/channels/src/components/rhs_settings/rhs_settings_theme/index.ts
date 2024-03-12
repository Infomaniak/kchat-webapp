// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {ActionCreatorsMapObject, bindActionCreators} from 'redux';

import {saveTheme, deleteTeamSpecificThemes} from 'mattermost-redux/actions/preferences';
import {getTheme, makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId, getMyTeamsCount} from 'mattermost-redux/selectors/entities/teams';

import {getDesktopThemePreference} from 'selectors/views/theme';

import {Preferences} from 'utils/constants';

import type {GlobalState} from 'types/store';

import RhsSettingsTheme from './rhs_settings_theme';

function makeMapStateToProps() {
    const getThemeCategory = makeGetCategory();

    return (state: GlobalState) => {
        return {
            currentTeamId: getCurrentTeamId(state),
            theme: getTheme(state),
            desktopThemePreference: getDesktopThemePreference(state),
            applyToAllTeams: getThemeCategory(state, Preferences.CATEGORY_THEME).length <= 1,
            showAllTeamsCheckbox: getMyTeamsCount(state) > 1,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            saveTheme,
            deleteTeamSpecificThemes,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(RhsSettingsTheme);
