// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {makeGetDraftsByPrefix} from 'selectors/drafts';

import {ScheduledIndicatorType} from 'components/schedule_post/scheduled_indicator';
import Timestamp from 'components/timestamp';
import ScheduleIcon from 'components/widgets/icons/schedule_icon';

import {StoragePrefixes} from 'utils/constants';

const useScheduledDrafts = (
    channelId: string,
    rootId: string,
    loc: ScheduledIndicatorType,
) => {
    let indicator;
    const history = useHistory();
    const prefix = loc === ScheduledIndicatorType.CHANNEL ? StoragePrefixes.DRAFT : StoragePrefixes.COMMENT_DRAFT;
    const key = prefix + (loc === ScheduledIndicatorType.CHANNEL ? channelId : rootId);
    const teamUrl = useSelector(getCurrentRelativeTeamUrl);
    const getDrafts = makeGetDraftsByPrefix(prefix);
    const scheduledDrafts = useSelector(getDrafts).
        filter((draft) => draft.key.includes(key) && draft.value.timestamp).
        map((draft) => draft.value).
        sort((a, b) => a.timestamp! - b.timestamp!);

    if (scheduledDrafts.length) {
        indicator = (
            <div className={classNames('schedule-indicator', {'pb-2': loc === ScheduledIndicatorType.CHANNEL})}>
                <ScheduleIcon className='schedule-indicator__icon'/>
                <FormattedMessage
                    id='create_post.schedule_post.indicator'
                    defaultMessage='You have scheduled {count} {count, plural, one {draft} other {drafts}} to be sent on this {type}. The next will be sent on {timestamp}. <GoToDrafts>See all draft messages</GoToDrafts>'
                    values={{
                        count: scheduledDrafts.length,
                        type: loc === ScheduledIndicatorType.CHANNEL ? (
                            <FormattedMessage
                                id='create_post.schedule_post.indicator.channel'
                                defaultMessage='channel'
                            />
                        ) : (
                            <FormattedMessage
                                id='create_post.schedule_post.indicator.thread'
                                defaultMessage='thread'
                            />
                        ),
                        timestamp: <Timestamp value={new Date(scheduledDrafts[0].timestamp! * 1000)}/>,
                        GoToDrafts: (chunks: string[]) => <a onClick={() => history.push(`${teamUrl}/drafts`)}>{chunks}</a>,
                    }}
                />
            </div>
        );
    }

    return [scheduledDrafts, indicator];
};

export default useScheduledDrafts;
