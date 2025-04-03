import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import {openModal} from 'actions/views/modals';
import {getEmojiMap} from 'selectors/emojis';

import type {GlobalState} from 'types/store';

import IkWelcomeButtons from './ik_welcome_buttons';

function mapStateToProps(state: GlobalState) {
    const emojiMap = getEmojiMap(state);

    return {
        emojiMap,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(IkWelcomeButtons);
