import type {FC} from 'react';
import React from 'react';

import './ik_upgrade_banner.css';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';
import {formatYMDDurationHuman} from 'mattermost-redux/utils/duration';

import useGetLimits from 'components/common/hooks/useGetLimits';
import {useNextPlan} from 'components/common/hooks/useNextPlan';

const OptionnalUpgradeBanner: FC = () => {
    const nextPlan = useNextPlan();
    const [limits] = useGetLimits();

    // @ts-expect-error global state vs RootState
    const locale = useSelector((s) => getCurrentUserLocale(s));
    const historyDurationLimit = sanitizeHistoryDuration(limits.messages?.history);

    if (historyDurationLimit === null) {
        return null;
    }

    const historyDurationLimitHuman = formatYMDDurationHuman(historyDurationLimit ?? '', locale);

    const descriptionSlot = (
        <div slot='sub-header'>
            <FormattedMessage
                id='upgrade_banner.description'
                values={{
                    duration: historyDurationLimitHuman,
                    plan: capitalize(nextPlan),
                }}
                defaultMessage='Messages and files older than {duration} are no longer available. Upgrade to the Standard kSuite Pro plan to enjoy unlimited conversation history.'
            />
        </div>
    );

    return (
        <wc-ksuite-pro-upgrade-banner
            offer={nextPlan}
            class='upgrade-banner'
            variant='chat::history'
        >
            {historyDurationLimit && descriptionSlot}
        </wc-ksuite-pro-upgrade-banner>
    );
};

export default OptionnalUpgradeBanner;

// The history duration input can be either:
// - a number: where 0 or -1 means "no duration" or "unlimited",
// - or a string: expected to be an ISO 8601 duration format.
function sanitizeHistoryDuration(history: string | number | undefined): string | null {
    if (history === undefined || history === null) {
        return null;
    }

    if (typeof history === 'number') {
        return null;
    }

    if (typeof history === 'string') {
        const isoDurationRegex = /^P(?=\d|T)(\d+Y)?(\d+M)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/i;
        if (!isoDurationRegex.test(history)) {
            return null;
        }
        return history;
    }

    return null;
}

function capitalize(str: string) {
    if (!str) {
        return '';
    }
    return str[0].toUpperCase() + str.slice(1);
}
