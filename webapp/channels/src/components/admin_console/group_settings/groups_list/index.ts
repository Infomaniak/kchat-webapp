// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {linkLdapGroup, unlinkLdapGroup, getLdapGroups as fetchLdapGroups} from 'mattermost-redux/actions/admin';
import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getLdapGroups, getLdapGroupsCount} from 'mattermost-redux/selectors/entities/admin';

import GroupsList from './groups_list';

const getSortedListOfLdapGroups = createSelector(
    'getSortedListOfLdapGroups',
    getLdapGroups,
    (ldapGroups) => {
        const groups = Object.values(ldapGroups);
        groups.sort((a, b) => a.name.localeCompare(b.name));
        return groups;
    },
);

function mapStateToProps(state: GlobalState) {
    return {
        groups: getSortedListOfLdapGroups(state),
        total: getLdapGroupsCount(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getLdapGroups: fetchLdapGroups,
            link: linkLdapGroup,
            unlink: unlinkLdapGroup,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsList);
