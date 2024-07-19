// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {openModal, closeModal} from 'actions/views/modals';

import MultiSelect from './multiselect';

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            closeModal,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(MultiSelect);
