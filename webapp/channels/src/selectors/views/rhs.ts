// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {GlobalState} from 'types/store';
import type {RhsFocusIntent} from 'types/store/rhs';

// IK: Get focus intent for RHS
export function getRhsFocusIntent(state: GlobalState): RhsFocusIntent {
    return state.views.rhs.rhsFocusIntent;
}
