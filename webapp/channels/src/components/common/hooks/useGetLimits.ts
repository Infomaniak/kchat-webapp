// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useState, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Limits} from '@mattermost/types/cloud';

import {getCloudLimits, getCloudLimitsLoaded} from 'mattermost-redux/selectors/entities/cloud';

import {getCloudLimits as getCloudLimitsAction} from 'actions/cloud';

import {useIsLoggedIn} from 'components/global_header/hooks';

export default function useGetLimits(): [Limits, boolean] {
    const isLoggedIn = useIsLoggedIn();
    const cloudLimits = useSelector(getCloudLimits);
    const cloudLimitsReceived = useSelector(getCloudLimitsLoaded);
    const dispatch = useDispatch();
    const [requestedLimits, setRequestedLimits] = useState(false);

    useEffect(() => {
        if (isLoggedIn && !requestedLimits && !cloudLimitsReceived) {
            dispatch(getCloudLimitsAction());
            setRequestedLimits(true);
        }
    }, [isLoggedIn, requestedLimits, cloudLimitsReceived, dispatch]);

    const result: [Limits, boolean] = useMemo(() => {
        return [cloudLimits, cloudLimitsReceived];
    }, [cloudLimits, cloudLimitsReceived]);
    return result;
}
