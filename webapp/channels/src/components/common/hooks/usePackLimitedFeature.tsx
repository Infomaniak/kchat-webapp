import {useSelector} from 'react-redux';

import {getCurrentPackName} from 'mattermost-redux/selectors/entities/teams';
import {getNextWcPackName} from 'mattermost-redux/utils/plans_util';

export function useNextPlan() {
    const currentPack = useSelector(getCurrentPackName);
    const nextPlan = getNextWcPackName(currentPack);

    return nextPlan;
}
