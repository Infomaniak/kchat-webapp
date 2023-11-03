// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import Timestamp from 'components/timestamp';
import ScheduleIcon from 'components/widgets/icons/schedule_icon';

import {type PostDraft} from 'types/store/draft';

import {ScheduledIndicatorType} from './index';

import './scheduled_indicator.scss';

type Props = {
    type: ScheduledIndicatorType;
    scheduledDrafts: PostDraft[];
};

const ScheduledIndicator = ({type, scheduledDrafts}: Props) => {
    const history = useHistory();
    const teamUrl = useSelector(getCurrentRelativeTeamUrl);
    const scheduledCount = scheduledDrafts.length;

    if (!scheduledCount) {
        return null;
    }

    const nextScheduledTimestamp = scheduledDrafts[0].timestamp!;

    return (
        <div className={classNames('schedule-indicator', {'pb-2': type === ScheduledIndicatorType.CHANNEL})}>
            <ScheduleIcon className='schedule-indicator__icon'/>
            <FormattedMessage
                id='create_post.schedule_post.indicator'
                defaultMessage='You have scheduled {count} {count, plural, one {draft} other {drafts}} to be sent on this {type}. The next will be sent on {timestamp}. <GoToDrafts>See all draft messages</GoToDrafts>'
                values={{
                    count: scheduledCount,
                    type: type === ScheduledIndicatorType.CHANNEL ? (
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
                    timestamp: <Timestamp value={new Date(nextScheduledTimestamp * 1000)}/>,
                    GoToDrafts: (chunks: string[]) => <a onClick={() => history.push(`${teamUrl}/drafts`)}>{chunks}</a>,
                }}
            />
        </div>
    );
};

export default ScheduledIndicator;
