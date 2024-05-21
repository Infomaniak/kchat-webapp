import {isServerVersionGreaterThanOrEqualTo} from './server_version';
import {getDesktopVersion} from './user_agent';

export const isCallV3Available = () => {
    return isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.3.0');
};

export const openKmeetInExternalWindow = (baseUrl: string, jwt: string, subject: string) => {
    window.open(baseUrl + `?jwt=${jwt}#config.disableInviteFunctions=true#config.localSubject=${encodeURIComponent(`"${subject}"`)}#config.prejoinConfig.enabled=false&config.deeplinking.disabled=true&config.startWithVideoMuted=true`, '_blank', 'noopener');
};
