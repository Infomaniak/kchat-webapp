// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {CloudUsage} from '@mattermost/types/cloud';

import {getUsage} from 'mattermost-redux/selectors/entities/usage';

import {getUsage as getUsageAction} from 'actions/cloud';

import {useIsLoggedIn} from 'components/global_header/hooks';

export default function useGetUsage(): CloudUsage {
    const usage = useSelector(getUsage);
    const isLoggedIn = useIsLoggedIn();

    const dispatch = useDispatch();

    const [requestedUsage, setRequestedUsage] = useState(false);
    useEffect(() => {
        if (isLoggedIn && !requestedUsage && !usage.usageLoaded) {
            dispatch(getUsageAction());
            setRequestedUsage(true);
        }
    }, [isLoggedIn, requestedUsage, usage, dispatch]);

    return usage;
}
