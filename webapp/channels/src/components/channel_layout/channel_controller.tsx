// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {cleanUpStatusAndProfileFetchingPoll} from 'mattermost-redux/actions/status_profile_polling';
import {getIsUserStatusesConfigEnabled} from 'mattermost-redux/selectors/entities/common';

import {addVisibleUsersInCurrentChannelToStatusPoll} from 'actions/status_actions';

import CenterChannel from 'components/channel_layout/center_channel';
import LoadingScreen from 'components/loading_screen';
import ProductNoticesModal from 'components/product_notices_modal/product_notices_modal';
import ResetStatusModal from 'components/reset_status_modal';
import Sidebar from 'components/sidebar';
import CRTPostsChannelResetWatcher from 'components/threading/channel_threads/posts_channel_reset_watcher';
import UnreadsStatusHandler from 'components/unreads_status_handler';

import {Constants} from 'utils/constants';
import {isInternetExplorer, isEdge} from 'utils/user_agent';

import Pluggable from 'plugins/pluggable';

const BODY_CLASS_FOR_CHANNEL = ['app__body', 'channel-view'];

type Props = {
    shouldRenderCenterChannel: boolean;

    // IK: For resizing left controls when lhs is resized since our layout has a split global header
    headerRef: React.RefObject<HTMLDivElement>;
}

export default function ChannelController(props: Props) {
    const enabledUserStatuses = useSelector(getIsUserStatusesConfigEnabled);
    const dispatch = useDispatch();

    useEffect(() => {
        const isMsBrowser = isInternetExplorer() || isEdge();
        const {navigator} = window;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const platform = navigator?.userAgentData?.platform || navigator?.platform || 'unknown';
        document.body.classList.add(...getClassnamesForBody(platform, isMsBrowser));

        return () => {
            document.body.classList.remove(...BODY_CLASS_FOR_CHANNEL);

            // This cleans up the status and profile setInterval of fetching poll we use to batch requests
            // when fetching statuses and profiles for a list of users.
            cleanUpStatusAndProfileFetchingPoll();
        };
    }, []);

    useEffect(() => {
        let loadStatusesIntervalId: NodeJS.Timeout;
        if (enabledUserStatuses) {
            loadStatusesIntervalId = setInterval(() => {
                dispatch(addVisibleUsersInCurrentChannelToStatusPoll());
            }, Constants.STATUS_INTERVAL);
        }

        return () => {
            clearInterval(loadStatusesIntervalId);
        };
    }, [enabledUserStatuses]);

    return (
        <>
            <CRTPostsChannelResetWatcher/>
            <Sidebar headerRef={props.headerRef}/>
            <div
                id='channel_view'
                className='channel-view'
                data-testid='channel_view'
            >
                <UnreadsStatusHandler/>
                {/* <ProductNoticesModal/> */}
                <div className={classNames('container-fluid channel-view-inner')}>
                    {props.shouldRenderCenterChannel ? <CenterChannel/> : <LoadingScreen centered={true}/>}
                    <Pluggable pluggableName='Root'/>
                    <ResetStatusModal/>
                </div>
            </div>
        </>
    );
}

export function getClassnamesForBody(platform: Window['navigator']['platform'], isMsBrowser = false) {
    const bodyClass = [...BODY_CLASS_FOR_CHANNEL];

    // OS Detection
    if (platform === 'Win32' || platform === 'Win64') {
        bodyClass.push('os--windows');
    } else if (platform === 'MacIntel' || platform === 'MacPPC') {
        bodyClass.push('os--mac');
    }

    // IE Detection
    if (isMsBrowser) {
        bodyClass.push('browser--ie');
    }

    return bodyClass;
}
