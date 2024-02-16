import {connect} from 'react-redux';
import type {ConnectedProps} from 'react-redux';

import {getIsMobileView} from 'selectors/views/browser';

import type {GlobalState} from 'types/store';

import EmojiPickerOverlay from './emoji_picker_overlay';

function mapStateToProps(state: GlobalState) {
    return {
        isMobileView: getIsMobileView(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EmojiPickerOverlay);
