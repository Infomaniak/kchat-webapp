import {connect} from 'react-redux';

import {getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import type {GlobalState} from 'types/store';

import {AtMentionSuggestion} from './at_mention_suggestion';

type OwnProps = {
    item: {
        user_id?: string;
        id?: string;
    };
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const status = ownProps.item?.user_id && ownProps.item?.id ? getStatusForUserId(state, ownProps.item.id) : undefined;

    return {
        status,
    };
}

export default connect(mapStateToProps, null, null, {forwardRef: true})(AtMentionSuggestion);

