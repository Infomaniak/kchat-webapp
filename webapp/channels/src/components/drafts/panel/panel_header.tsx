// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SyncIcon} from '@infomaniak/compass-icons/components';
import cn from 'classnames';
import type {ComponentProps} from 'react';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import Constants from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import Timestamp from 'components/timestamp';
import Tooltip from 'components/tooltip';
import Tag from 'components/widgets/tag/tag';

import './panel_header.scss';

const TIMESTAMP_PROPS: Partial<ComponentProps<typeof Timestamp>> = {
    day: 'numeric',
    useSemanticOutput: false,
    useTime: false,
    units: [
        'now',
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'year',
    ],
};

type Props = {
    actions: React.ReactNode;
    hover: boolean;
    timestamp: number;
    remote: boolean;
    title: React.ReactNode;
    isScheduled: boolean;
    scheduledTimestamp?: number;
    scheduledWillNotBeSent: boolean;
}

function PanelHeader({
    actions,
    hover,
    timestamp,
    remote,
    title,
    isScheduled,
    scheduledTimestamp,
    scheduledWillNotBeSent,
}: Props) {
    const syncTooltip = (
        <Tooltip id='drafts-sync-tooltip'>
            <FormattedMessage
                id='drafts.info.sync'
                defaultMessage='Updated from another device'
            />
        </Tooltip>
    );

    let tag = (
        <FormattedMessage
            id='drafts.info.tag.not_scheduled'
            defaultMessage='Not scheduled'
        />
    );
    if (isScheduled) {
        const tagVariant = scheduledWillNotBeSent ? 'danger' : 'info';
        const tagText = scheduledWillNotBeSent ? (
            <FormattedMessage
                id='drafts.info.tag.will_not_be_sent'
                defaultMessage='Will not be sent'
            />
        ) : (
            <FormattedMessage
                id='drafts.info.tag.scheduled'
                defaultMessage='Scheduled'
            />
        );
        tag = (
            <Tag
                variant={tagVariant}
                text={tagText}
                uppercase={true}
            />
        );
    }

    let time;
    if (timestamp) {
        time = (
            <Timestamp
                value={new Date(timestamp)}
                {...TIMESTAMP_PROPS}
            />
        );
    }
    if (isScheduled && scheduledTimestamp) {
        time = (
            <FormattedMessage
                id='draft.info.scheduled_timestamp'
                defaultMessage='Send on {timestamp}'
                values={{
                    timestamp: <Timestamp value={new Date(scheduledTimestamp * 1000)}/>,
                }}
            />
        );
    }

    return (
        <header className='PanelHeader'>
            <div className='PanelHeader__left'>
                {title}
            </div>
            <div className='PanelHeader__right'>
                <div className={cn('PanelHeader__actions', {show: hover})}>
                    {actions}
                </div>
                <div className={cn('PanelHeader__info', {hide: hover})}>
                    {remote && <div className='PanelHeader__sync-icon'>
                        <OverlayTrigger
                            trigger={Constants.OVERLAY_DEFAULT_TRIGGER}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={syncTooltip}
                        >
                            <SyncIcon
                                size={18}
                            />
                        </OverlayTrigger>
                    </div>}
                    <div className='PanelHeader__timestamp'>
                        {time}
                    </div>
                    {tag}
                </div>
            </div>
        </header>
    );
}

export default PanelHeader;
