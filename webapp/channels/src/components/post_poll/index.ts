import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {submitImmediateCommand} from 'actions/views/create_comment';

import type {GlobalState} from 'types/store';

import Poll from './poll';

function mapStateToProps(state: GlobalState) {
    const currentChannelId = getCurrentChannelId(state);

    return {
        currentChannelId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            submitImmediateCommand,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Poll);
