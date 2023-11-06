// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import type {UserTimezone} from '@mattermost/types/users';

import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {makeGetUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import {Preferences} from 'utils/constants';

import type {GlobalState} from 'types/store';

import * as RelativeRanges from './relative_ranges';
import type {Props as TimestampProps} from './timestamp';
import Timestamp, {supportsHourCycle} from './timestamp';

type Props = {
    userTimezone?: UserTimezone;
    hour12?: TimestampProps['hour12'];
    timeZone?: TimestampProps['timeZone'];
    hourCycle?: TimestampProps['hourCycle'];
}

export function makeMapStateToProps() {
    const getUserTimezone = makeGetUserTimezone();

    return (state: GlobalState, ownProps: Props) => {
        const currentUserId = getCurrentUserId(state);

        let timeZone: TimestampProps['timeZone'];
        let hourCycle: TimestampProps['hourCycle'];
        let hour12: TimestampProps['hour12'];

        if (areTimezonesEnabledAndSupported(state)) {
            timeZone = getUserCurrentTimezone(ownProps.userTimezone ?? getUserTimezone(state, currentUserId)) ?? undefined;
        }

        const useMilitaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.USE_MILITARY_TIME, false);

        if (supportsHourCycle) {
            hourCycle = ownProps.hourCycle || (useMilitaryTime ? 'h23' : 'h12');
        } else {
            hour12 = ownProps.hour12 ?? (!useMilitaryTime);
        }

        return {timeZone: ownProps.timeZone || timeZone, hourCycle, hour12};
    };
}

export default connect(makeMapStateToProps)(Timestamp);

export {default as SemanticTime} from './semantic_time';
export {RelativeRanges};
