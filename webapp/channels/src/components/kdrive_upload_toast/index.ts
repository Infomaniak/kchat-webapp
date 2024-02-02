// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Action, ActionCreatorsMapObject, Dispatch} from 'redux';

import {setKDriveToast} from 'actions/kdrive_actions';
import {getKDriveToast} from 'selectors/kdrive_plugin';

import type {GlobalState} from 'types/store';

import KDriveUploadToast from './kdrive_upload_toast';

const mapStateToProps = (state: GlobalState) => {
    return {
        toast: getKDriveToast(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators<ActionCreatorsMapObject<Action>, any>({
    setKDriveToast,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(KDriveUploadToast);
