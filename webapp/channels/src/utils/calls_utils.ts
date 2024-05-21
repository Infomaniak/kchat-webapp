import {isServerVersionGreaterThanOrEqualTo} from './server_version';
import {getDesktopVersion} from './user_agent';

export const isCallV3Available = () => {
    return isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '3.3.0');
};

export const openKmeetInExternalWindow = (baseUrl: string, jwt: string, subject: string) => {
    let url = baseUrl;
    url += `?jwt=${jwt}`;
    url += '#config.disableInviteFunctions=true';
    url += `#config.localSubject=${subject}`;
    url += '#config.prejoinConfig.enabled=false';
    url += '#config.deeplinking.disabled=true';
    url += '#config.startWithVideoMuted=true';
    window.open(url, '_blank', 'noopener');
};
