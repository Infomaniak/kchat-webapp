// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import {AnnouncementBarTypes} from 'utils/constants';

import AnnouncementBar from '../default_announcement_bar';

type Props = {
    buildHash?: string;
    isNewVersionCanaryOnly?: boolean;
}

const reloadPage = () => {
    window.location.reload();
};

const VersionBar = ({
    buildHash,
    isNewVersionCanaryOnly,
}: Props) => {
    const [buildHashOnAppLoad, setBuildHashOnAppLoad] = useState<string|undefined>(buildHash === 'none' ? GIT_RELEASE : buildHash);
    const isCanary = document.cookie.indexOf('KCHAT_NEXT=always') !== -1;

    // IK: isNewVersionCanaryOnly is populated only on WS
    // For example, this variable is needed if WS trigger update for Canary, but not stable
    // If Client receive this message, but it is on stable, the update will be ignored
    // Otherwise, API call to check for update based on which one requested it - isNewVersionCanaryOnly will be undefined
    const isStableUpdate = !isCanary && isNewVersionCanaryOnly !== true;
    const isNextUpdate = isCanary && isNewVersionCanaryOnly !== false;

    useEffect(() => {
        if (!buildHashOnAppLoad && buildHash) {
            setBuildHashOnAppLoad(buildHash);
        }
    }, [buildHash, buildHashOnAppLoad]);

    if (!buildHashOnAppLoad || buildHash === 'none') {
        return null;
    }

    if (buildHashOnAppLoad !== buildHash && (isNextUpdate || isStableUpdate)) {
        return (
            <AnnouncementBar
                type={AnnouncementBarTypes.ANNOUNCEMENT}
                message={
                    <>
                        <FormattedMessage
                            id='version_bar.new'
                            defaultMessage='A new version of kChat is available.'
                        />
                        <a
                            onClick={reloadPage}
                            style={{marginLeft: '.5rem'}}
                        >
                            <FormattedMessage
                                id='version_bar.refresh'
                                defaultMessage='Refresh the app now'
                            />
                        </a>
                    </>
                }
            />
        );
    }

    return null;
};

export default React.memo(VersionBar);
