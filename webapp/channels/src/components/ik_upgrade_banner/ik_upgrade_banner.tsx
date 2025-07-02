import type {FC} from 'react';
import React from 'react';

import './ik_upgrade_banner.css';
import {useSelector} from 'react-redux';

import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';
import {formatYMDDurationHuman} from 'mattermost-redux/utils/duration';

import useGetLimits from 'components/common/hooks/useGetLimits';
import {useNextPlan} from 'components/common/hooks/useNextPlan';

const UpgradeBanner: FC = () => {
    const nextPlan = useNextPlan();
    const [limits] = useGetLimits();

    // @ts-expect-error global state vs RootState
    const locale = useSelector((s) => getCurrentUserLocale(s));
    const historyDurationLimit = (limits.messages?.history as unknown as string) ?? ''; //messages.history is wrongly typed (we received an ISO 8601 duration) but i don't want to changes that many part

    const historyDurationLimitHuman = formatYMDDurationHuman(historyDurationLimit, locale);

    //TODO: DO NOT MERGE ! DO NOT MERGE ! DO NOT MERGE ! need to setup text correctly
    return (
        <wc-ksuite-pro-upgrade-banner
            offer={nextPlan}
            class='upgrade-banner'
            variant='chat::history'
        >
            <div slot='sub-heading'>
                {historyDurationLimitHuman}
            </div>
        </wc-ksuite-pro-upgrade-banner>
    );
};

export default UpgradeBanner;
