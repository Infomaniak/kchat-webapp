// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';
import {makeGetDraftsByPrefix} from 'selectors/drafts';

import {StoragePrefixes} from 'utils/constants';

import ScheduledIndicator from './scheduled_indicator';

export enum ScheduledIndicatorType {
    CHANNEL,
    THREAD,
}

type OwnProps = {
    type: ScheduledIndicatorType;
    channelId?: string;
    rootId?: string;
};

const getScheduledDrafts = (state: GlobalState, ownProps: OwnProps) => {
    const prefix = ownProps.type === ScheduledIndicatorType.CHANNEL ? StoragePrefixes.DRAFT : StoragePrefixes.COMMENT_DRAFT;
    const key = prefix + (ownProps.type === ScheduledIndicatorType.CHANNEL ? ownProps.channelId : ownProps.rootId);
    const getDrafts = makeGetDraftsByPrefix(prefix);
    return getDrafts(state).
        filter((draft) => draft.key.includes(key) && draft.value.timestamp).
        map((draft) => draft.value).
        sort((a, b) => a.timestamp! - b.timestamp!);
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    return {
        scheduledDrafts: getScheduledDrafts(state, ownProps),
    };
};

export default connect(mapStateToProps)(ScheduledIndicator);
