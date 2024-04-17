import {connect} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/common';

import {getCurrentLocale} from 'selectors/i18n';

import type {GlobalState} from 'types/store';

import KmeetCalls from './kmeet_calls';

function mapStateToProps(state: GlobalState) {
    const user = getCurrentUser(state);
    const locale = getCurrentLocale(state);

    return {
        user,
        locale,
    };
}

export default connect(mapStateToProps, {})(KmeetCalls);
