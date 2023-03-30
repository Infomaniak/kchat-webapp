// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect} from 'react';

const getOperatingSystem = (userAgent: string) => {
    const userAgentLC = userAgent.toLowerCase();

    if (userAgentLC.includes('android')) {
        return 'Android';
    }
    if ((/(iphone|ipad|ipod)/).test(userAgentLC)) {
        return 'Ios';
    }
    if (userAgentLC.includes('windows')) {
        return 'Windows';
    }
    if (userAgentLC.includes('mac')) {
        return 'MacOS';
    }
    if (userAgentLC.includes('linux') || userAgentLC.includes('x11')) {
        return 'Linux';
    }

    return 'unknown';
}

const useGetOs = () => {
    const [operatingSystem, setOperatingSystem] = useState('unknown');

    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        setOperatingSystem(getOperatingSystem(userAgent));
    }, []);

    return operatingSystem;
};

export default useGetOs;
