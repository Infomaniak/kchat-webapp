// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {Role} from '@mattermost/types/roles.js';
import type {GlobalState} from '@mattermost/types/store.js';

import {loadRolesIfNeeded, editRole} from 'mattermost-redux/actions/roles';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles';
import type {ActionFunc, ActionResult, GenericAction} from 'mattermost-redux/types/actions.js';

import {setNavigationBlocked} from 'actions/admin_actions.jsx';

import PermissionSystemSchemeSettings from './permission_system_scheme_settings';

function mapStateToProps(state: GlobalState) {
    return {
        config: getConfig(state),
        license: getLicense(state),
        roles: getRoles(state),
    };
}
type Actions = {
    loadRolesIfNeeded: (roles: Iterable<string>) => void;
    editRole: (role: Partial<Role>) => Promise<ActionResult>;
    setNavigationBlocked: (blocked: boolean) => void;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            loadRolesIfNeeded,
            editRole,
            setNavigationBlocked,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermissionSystemSchemeSettings);
