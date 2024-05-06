import {isServerVersionGreaterThanOrEqualTo} from './server_version';
import {getDesktopVersion} from './user_agent';

export const isCallV3Available = () => {
    return isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.3.0');
};
