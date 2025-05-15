// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {useRouteMatch} from 'react-router-dom';

import {getThreadCounts, getThreadsForCurrentTeam} from 'mattermost-redux/actions/threads';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {
    getThreadOrderInCurrentTeam,
    getUnreadThreadOrderInCurrentTeam,
    getThreadCountsInCurrentTeam,
    getThread,
} from 'mattermost-redux/selectors/entities/threads';

import {clearLastUnreadChannel} from 'actions/global_actions';
import {loadProfilesForSidebar} from 'actions/user_actions';
import {selectLhsItem} from 'actions/views/lhs';
import {suppressRHS, unsuppressRHS} from 'actions/views/rhs';
import {setSelectedThreadId} from 'actions/views/threads';
import {getIsRhsOpen} from 'selectors/rhs';
import {getSelectedThreadIdInCurrentTeam} from 'selectors/views/threads';
import {useGlobalState} from 'stores/hooks';
import LocalStorageStore from 'stores/local_storage_store';

import LoadingScreen from 'components/loading_screen';
import NoResultsIndicator from 'components/no_results_indicator';

import {PreviousViewedTypes} from 'utils/constants';
import {Mark, Measure, measureAndReport} from 'utils/performance_telemetry';

import type {GlobalState} from 'types/store/index';
import {LhsItemType, LhsPage} from 'types/store/lhs';

import ThreadList, {ThreadFilter, FILTER_STORAGE_KEY} from './thread_list';
import ThreadPane from './thread_pane';

import NoThreadIllustration from '../common/no_thread_illustration';
import {useThreadRouting} from '../hooks';
import ThreadViewer from '../thread_viewer';

import './global_threads.scss';

const NO_THREAD_ILLUSTRATION = (<NoThreadIllustration/>);

const GlobalThreads = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const {params: {threadIdentifier}} = useRouteMatch<{threadIdentifier?: string}>();
    const [filter, setFilter] = useGlobalState(ThreadFilter.none, FILTER_STORAGE_KEY);
    const {currentTeamId, currentUserId, clear} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const selectedThread = useSelector((state: GlobalState) => getThread(state, threadIdentifier));
    const selectedThreadId = useSelector(getSelectedThreadIdInCurrentTeam);
    const selectedPost = useSelector((state: GlobalState) => getPost(state, threadIdentifier!));
    const threadIds = useSelector((state: GlobalState) => getThreadOrderInCurrentTeam(state), shallowEqual);
    const unreadThreadIds = useSelector((state: GlobalState) => getUnreadThreadOrderInCurrentTeam(state), shallowEqual);
    const numUnread = counts?.total_unread_threads || 0;
    const isRHSOpened = useSelector(getIsRhsOpen);

    useEffect(() => {
        dispatch(suppressRHS);
        dispatch(selectLhsItem(LhsItemType.Page, LhsPage.Threads));
        dispatch(clearLastUnreadChannel);
        loadProfilesForSidebar();

        const penultimateType = LocalStorageStore.getPreviousViewedType(currentUserId, currentTeamId);

        if (penultimateType !== PreviousViewedTypes.THREADS) {
            LocalStorageStore.setPenultimateViewedType(currentUserId, currentTeamId, penultimateType);
            LocalStorageStore.setPreviousViewedType(currentUserId, currentTeamId, PreviousViewedTypes.THREADS);
        }

        // unsuppresses RHS on navigating away (unmount)
        return () => {
            dispatch(unsuppressRHS);
        };
    }, []);

    useEffect(() => {
        dispatch(getThreadCounts(currentUserId, currentTeamId));
    }, [currentTeamId, currentUserId]);

    useEffect(() => {
        if (!selectedThreadId || selectedThreadId !== threadIdentifier) {
            dispatch(setSelectedThreadId(currentTeamId, selectedThread?.id));
        }
    }, [currentTeamId, selectedThreadId, threadIdentifier]);

    const isEmptyList = isEmpty(threadIds) && isEmpty(unreadThreadIds);

    const [isLoading, setLoading] = useState(isEmptyList);

    const shouldLoadThreads = isEmpty(threadIds);
    const shouldLoadUnreadThreads = isEmpty(unreadThreadIds);

    useEffect(() => {
        const promises = [];

        // this is needed to jump start threads fetching
        if (shouldLoadThreads) {
            promises.push(dispatch(getThreadsForCurrentTeam({unread: false})));
        }

        if (filter === ThreadFilter.unread && shouldLoadUnreadThreads) {
            promises.push(dispatch(getThreadsForCurrentTeam({unread: true})));
        }

        Promise.all(promises).then(() => {
            setLoading(false);
        });
    }, [filter, threadIds, unreadThreadIds]);

    useEffect(() => {
        if (!isLoading) {
            measureAndReport({
                name: Measure.GlobalThreadsLoad,
                startMark: Mark.GlobalThreadsLinkClicked,
                canFail: true,
            });
            performance.clearMarks(Mark.GlobalThreadsLinkClicked);
        }
    }, [isLoading]);

    useEffect(() => {
        if (!selectedThread && !selectedPost && !isLoading) {
            clear();
        }
    }, [currentTeamId, selectedThread, selectedPost, isLoading, counts, filter]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(setSelectedThreadId(currentTeamId, ''));
        };
    }, []);

    return (
        <div
            id='app-content'
            className={classNames('GlobalThreads app__content', {
                'thread-selected': Boolean(selectedThread),
                'rhs-opened': isRHSOpened,
            })}
        >
            {isLoading || isEmptyList ? (
                <div className='no-results__holder'>
                    {isLoading ? (
                        <LoadingScreen/>
                    ) : (
                        <NoResultsIndicator
                            expanded={true}
                            iconGraphic={NO_THREAD_ILLUSTRATION}
                            title={formatMessage({
                                id: 'globalThreads.noThreads.title',
                                defaultMessage: 'No followed threads yet',
                            })}
                            subtitle={formatMessage({
                                id: 'globalThreads.noThreads.subtitle',
                                defaultMessage: 'Any threads you are mentioned in or have participated in will show here along with any threads you have followed.',
                            })}
                        />
                    )}
                </div>
            ) : (
                <>
                    <ThreadList
                        currentFilter={filter}
                        setFilter={setFilter}
                        someUnread={Boolean(numUnread)}
                        selectedThreadId={threadIdentifier}
                        ids={threadIds}
                        unreadIds={unreadThreadIds}
                    />
                    {selectedThread && selectedPost ? (
                        <ThreadPane
                            thread={selectedThread}
                        >
                            <ThreadViewer
                                rootPostId={selectedThread.id}
                                useRelativeTimestamp={true}
                                isThreadView={true}
                            />
                        </ThreadPane>
                    ) : (
                        <NoResultsIndicator
                            expanded={true}
                            iconGraphic={NO_THREAD_ILLUSTRATION}
                            title={formatMessage({
                                id: 'globalThreads.threadPane.unselectedTitle',
                                defaultMessage: 'Select a Thread',
                            })}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default memo(GlobalThreads);
