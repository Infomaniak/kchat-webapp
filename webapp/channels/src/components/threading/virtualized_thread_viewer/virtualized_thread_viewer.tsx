// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * ⚠️ IK WARNING: Heavily customized virtualized thread viewer ⚠️
 *
 * This implementation diverges significantly from upstream react-window behavior.
 *
 * Any upstream merges or refactors must be reviewed carefully,
 * since assumptions about list measurement, resize timing,
 * or edit handling may conflict with this logic.
 *
 * DO NOT casually replace with upstream changes without
 * validating resize, scroll, and edit/cancel flows.
 */

import {DynamicSizeList} from 'dynamic-virtualized-list';
import type {OnScrollArgs, OnItemsRenderedArgs} from 'dynamic-virtualized-list';
import React, {PureComponent} from 'react';
import type {RefObject} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import type {Post} from '@mattermost/types/posts';
import type {UserProfile} from '@mattermost/types/users';

import {Posts} from 'mattermost-redux/constants';
import {getNewMessagesIndex, isDateLine, isStartOfNewMessages, isCreateComment} from 'mattermost-redux/utils/post_list';

import NewRepliesBanner from 'components/new_replies_banner';
import FloatingTimestamp from 'components/post_view/floating_timestamp';
import {THREADING_TIME as BASE_THREADING_TIME} from 'components/threading/common/options';

import Constants from 'utils/constants';
import DelayedAction from 'utils/delayed_action';
import {getPreviousPostId, getLatestPostId} from 'utils/post_utils';
import * as Utils from 'utils/utils';

import type {NewMessagesSeparatorActionComponent} from 'types/store/plugins';
import type {FakePost} from 'types/store/rhs';

import CreateComment from './create_comment';
import Row from './thread_viewer_row';

import './virtualized_thread_viewer.scss';

type Props = {
    currentUserId: string;
    directTeammate: UserProfile | undefined;
    highlightedPostId?: Post['id'];
    selectedPostFocusedAt?: number;
    lastPost: Post;
    onCardClick: (post: Post) => void;
    replyListIds: string[];
    selected: Post | FakePost;
    useRelativeTimestamp: boolean;
    isMobileView: boolean;
    isThreadView: boolean;
    isMember: boolean;
    newMessagesSeparatorActions: NewMessagesSeparatorActionComponent[];
    inputPlaceholder?: string;
    measureRhsOpened: () => void;

    // Ik: Needed to trigger a resize on the virtual list when a user cancels an edit,
    // since canceling doesn’t otherwise trigger a component update.
    postsEditingMap: Record<string, boolean>;
}

type State = {
    isScrolling: boolean;
    topRhsPostId?: string;
    userScrolledToBottom: boolean;
    lastViewedBottom: number;
    visibleStartIndex?: number;
    visibleStopIndex?: number;
    overscanStartIndex?: number;
    overscanStopIndex?: number;
    innerRefHeight: number;
    postCreateContainerRefHeight: number;
}

const virtListStyles = {
    willChange: 'transform',
    overflowY: 'auto',
    overflowAnchor: 'none',
    bottom: '0px',
};

const innerStyles = {
    paddingTop: '28px',
};

const THREADING_TIME: typeof BASE_THREADING_TIME = {
    ...BASE_THREADING_TIME,
    units: [
        'now',
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'year',
    ],
};

const OFFSET_TO_SHOW_TOAST = -50;

// To handle issue caused by slight difference in scrollHeight and scrollOffset + clientHeight of virtaulized list
// we add a buffer to the scrollOffset
const SCROLL_OFFSET_BUFFER = 5;

const OVERSCAN_COUNT_FORWARD = 80;
const OVERSCAN_COUNT_BACKWARD = 80;

class ThreadViewerVirtualized extends PureComponent<Props, State> {
    private mounted = false;
    private scrollStopAction: DelayedAction;
    private scrollShortCircuit = 0;
    postCreateContainerRef: RefObject<HTMLDivElement>;
    listRef: RefObject<DynamicSizeList>;
    innerRef: RefObject<HTMLDivElement>;
    initRangeToRender: number[];

    // Ik: used to recompute resize
    private innerResizeObserver?: ResizeObserver;
    private composerResizeObserver?: ResizeObserver;

    constructor(props: Props) {
        super(props);

        const postIndex = this.getInitialPostIndex();

        this.initRangeToRender = [
            Math.max(postIndex - 30, 0),
            Math.max(postIndex + 30, Math.min(props.replyListIds.length - 1, 50)),
        ];

        this.listRef = React.createRef();
        this.innerRef = React.createRef();
        this.postCreateContainerRef = React.createRef();
        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.state = {
            isScrolling: false,
            userScrolledToBottom: false,
            topRhsPostId: undefined,
            lastViewedBottom: Date.now(),
            visibleStartIndex: undefined,
            visibleStopIndex: undefined,
            overscanStartIndex: undefined,
            overscanStopIndex: undefined,
            innerRefHeight: 0,
            postCreateContainerRefHeight: 0,
        };
    }

    componentDidMount() {
        this.mounted = true;

        this.props.measureRhsOpened();

        /* ik: use to recompute resize [start]  */

        if (this.innerRef.current) {
            this.innerResizeObserver = new ResizeObserver(() => this.updateRects());
            this.innerResizeObserver.observe(this.innerRef.current);
        }

        if (this.postCreateContainerRef.current) {
            this.composerResizeObserver = new ResizeObserver(() => this.updateRects());
            this.composerResizeObserver.observe(this.postCreateContainerRef.current);
        }

        // Initial measurement
        this.safeUpdateRects();

        /* ik: use to recompute resize [end] */
    }

    componentWillUnmount() {
        this.mounted = false;

        // ik: cleanup observers
        this.innerResizeObserver?.disconnect();
        this.composerResizeObserver?.disconnect();
    }

    componentDidUpdate(prevProps: Props) {
        const {highlightedPostId, selectedPostFocusedAt, lastPost, currentUserId, directTeammate, isMember} = this.props;

        /* ik: use to recompute resize when editing [start]  */
        const {replyListIds, postsEditingMap} = this.props;

        for (const postId of replyListIds) {
            if (prevProps.postsEditingMap[postId] !== postsEditingMap[postId]) {
                this.safeUpdateRects(); // triggers recalculation for both start/cancel editing
                break;
            }
        }

        /* ik: use to recompute resize when editing [end]  */

        // In case the user is being deactivated, we need to trigger a re-render
        if (directTeammate?.delete_at !== prevProps.directTeammate?.delete_at) {
            this.scrollToBottom();
        }

        if ((highlightedPostId && prevProps.highlightedPostId !== highlightedPostId) ||
            prevProps.selectedPostFocusedAt !== selectedPostFocusedAt) {
            this.scrollToHighlightedPost();
        } else if (
            prevProps.lastPost.id !== lastPost.id &&
            (lastPost.user_id === currentUserId || this.state.userScrolledToBottom)
        ) {
            this.scrollToBottom();
        } else if (prevProps.isMember !== isMember) {
            this.scrollToBottom();
        }

        // ik: After updates (props/state) try to re-measure to keep sizes accurate.
        // schedule on next RAF to ensure DOM updated
        this.safeUpdateRects();
    }

    canLoadMorePosts() {
        return Promise.resolve();
    }

    // Ik: compute resize
    // updateRects() → single measurement pass, scheduled in rAF so DOM is painted.
    updateRects() {
        if (!this.mounted) {
            return;
        }

        window.requestAnimationFrame(() => {
            const innerH = this.innerRef.current?.clientHeight ?? 0;
            const postCreateH = this.postCreateContainerRef.current?.clientHeight ?? 0;

            if (innerH !== this.state.innerRefHeight || postCreateH !== this.state.postCreateContainerRefHeight) {
                this.setState({
                    innerRefHeight: innerH,
                    postCreateContainerRefHeight: postCreateH,
                });
            }
        });
    }

    // Ik: safeUpdateRects() → stronger variant that retries updateRects across multiple frames.
    // Needed because some UI changes (edit → cancel, collapsing input, async virtual list render)
    // don’t always produce a stable DOM height in the same frame as the Redux/prop change.
    // By running up to 3 times (current frame + 2 rAFs), we guarantee the layout
    // is eventually measured correctly without noticeable delay for the user.
    safeUpdateRects() {
        this.updateRects();
        window.requestAnimationFrame(() => this.updateRects()); // expected duplication
        setTimeout(() => this.updateRects(), 50);// expected duplication
    }

    initScrollToIndex = (): {index: number; position: string; offset?: number} => {
        const {highlightedPostId, replyListIds} = this.props;

        if (highlightedPostId) {
            const index = replyListIds.indexOf(highlightedPostId);
            return {
                index,
                position: 'center',
            };
        }

        const newMessagesSeparatorIndex = getNewMessagesIndex(replyListIds);
        if (newMessagesSeparatorIndex > 0) {
            return {
                index: newMessagesSeparatorIndex,
                position: 'start',
                offset: OFFSET_TO_SHOW_TOAST,
            };
        }

        return {
            index: 0,
            position: 'end',
        };
    };

    handleScroll = ({scrollHeight, scrollUpdateWasRequested, scrollOffset, clientHeight}: OnScrollArgs) => {
        if (scrollHeight <= 0) {
            return;
        }

        const updatedState: Partial<State> = {};

        const userScrolledToBottom = scrollHeight - scrollOffset - SCROLL_OFFSET_BUFFER <= clientHeight;

        if (!scrollUpdateWasRequested) {
            this.scrollShortCircuit = 0;

            updatedState.userScrolledToBottom = userScrolledToBottom;

            if (this.props.isMobileView) {
                if (!this.state.isScrolling) {
                    updatedState.isScrolling = true;
                }

                if (this.scrollStopAction) {
                    this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
                }
            }
        }

        if (userScrolledToBottom) {
            updatedState.lastViewedBottom = Date.now();
        }

        this.setState(updatedState as State);
    };

    updateFloatingTimestamp = (visibleTopItem: number) => {
        if (!this.props.replyListIds) {
            return;
        }

        this.setState({
            topRhsPostId: getLatestPostId(this.props.replyListIds.slice(visibleTopItem)),
        });
    };

    onItemsRendered = ({
        visibleStartIndex,
        visibleStopIndex,
        overscanStartIndex,
        overscanStopIndex,
    }: OnItemsRenderedArgs) => {
        if (this.props.isMobileView) {
            this.updateFloatingTimestamp(visibleStartIndex);
        }
        this.setState({
            visibleStartIndex,
            visibleStopIndex,
            overscanStartIndex,
            overscanStopIndex,
        });
    };

    getInitialPostIndex = (): number => {
        let postIndex = 0;

        if (this.props.highlightedPostId) {
            postIndex = this.props.replyListIds.findIndex((postId) => postId === this.props.highlightedPostId);
        } else {
            postIndex = getNewMessagesIndex(this.props.replyListIds);
        }

        return postIndex === -1 ? 0 : postIndex;
    };

    handleScrollToFailed = (index: number) => {
        if (index < 0 || index >= this.props.replyListIds.length) {
            return;
        }
        const {overscanStopIndex, overscanStartIndex} = this.state;

        if (overscanStartIndex != null && index < overscanStartIndex) {
            this.scrollToItemCorrection(index, Math.max(overscanStartIndex + 1, 0));
        }

        if (overscanStopIndex != null && index > overscanStopIndex) {
            this.scrollToItemCorrection(index, Math.min(overscanStopIndex - 1, this.props.replyListIds.length - 1));
        }
    };

    scrollToItemCorrection = (index: number, nearIndex: number) => {
        // stop after 10 times so we won't end up in an infinite loop
        if (this.scrollShortCircuit > 10) {
            return;
        }

        this.scrollShortCircuit++;

        // this should not trigger a failure to scroll
        // it should always be an index in between rendered items (overscanStartIndex < nearIndex < overscanStopIndex)
        this.scrollToItem(nearIndex, 'start');

        window.requestAnimationFrame(() => {
            this.scrollToItem(index, 'start');
        });
    };

    scrollToItem = (index: number, position: string, offset?: number) => {
        if (this.listRef.current) {
            this.listRef.current.scrollToItem(index, position, offset);
        }
    };

    scrollToBottom = () => {
        this.scrollToItem(0, 'end');
    };

    handleToastDismiss = () => {
        this.setState({lastViewedBottom: Date.now()});
    };

    handleToastClick = () => {
        const index = getNewMessagesIndex(this.props.replyListIds);
        if (index >= 0) {
            this.scrollToItem(index, 'start', OFFSET_TO_SHOW_TOAST);
        } else {
            this.scrollToBottom();
        }
    };

    scrollToHighlightedPost = () => {
        const {highlightedPostId, replyListIds} = this.props;

        if (highlightedPostId) {
            this.setState({userScrolledToBottom: false}, () => {
                this.scrollToItem(replyListIds.indexOf(highlightedPostId), 'center');
            });
        }
    };

    handleScrollStop = () => {
        if (this.mounted) {
            this.setState({isScrolling: false});
        }
    };

    renderRow = ({data, itemId, style}: {data: any; itemId: any; style: any}) => {
        const index = data.indexOf(itemId);
        let className = '';
        let a11yIndex = 0;
        const basePaddingClass = 'post-row__padding';
        const previousItemId = (index !== -1 && index < data.length - 1) ? data[index + 1] : '';
        const nextItemId = (index > 0 && index < data.length) ? data[index - 1] : '';

        if (isDateLine(nextItemId) || isStartOfNewMessages(nextItemId)) {
            className += basePaddingClass + ' bottom';
        }

        if (isDateLine(previousItemId) || isStartOfNewMessages(previousItemId)) {
            if (className.includes(basePaddingClass)) {
                className += ' top';
            } else {
                className += basePaddingClass + ' top';
            }
        }

        const isLastPost = itemId === this.props.lastPost.id;
        const isRootPost = itemId === this.props.selected.id;
        const isDeletedPost = ('delete_at' in this.props.selected && this.props.selected.delete_at !== 0) ||
            ('state' in this.props.selected && this.props.selected.state === Posts.POST_DELETED);

        if (!isDateLine(itemId) && !isStartOfNewMessages(itemId) && !isCreateComment(itemId) && !isRootPost) {
            a11yIndex++;
        }

        return (
            <div
                style={style}
                className={className}
            >
                <Row
                    a11yIndex={a11yIndex}
                    currentUserId={this.props.currentUserId}
                    isRootPost={isRootPost}
                    isLastPost={isLastPost}
                    isDeletedPost={isDeletedPost}
                    listId={itemId}
                    onCardClick={this.props.onCardClick}
                    previousPostId={getPreviousPostId(data, index)}
                    timestampProps={this.props.useRelativeTimestamp ? THREADING_TIME : undefined}
                    threadId={this.props.selected.id}
                    newMessagesSeparatorActions={this.props.newMessagesSeparatorActions}
                />
            </div>
        );
    };

    getInnerStyles = (): React.CSSProperties|undefined => {
        if (!this.props.useRelativeTimestamp) {
            return innerStyles;
        }

        return undefined;
    };

    isNewMessagesVisible = (): boolean => {
        const {visibleStopIndex} = this.state;
        const newMessagesSeparatorIndex = getNewMessagesIndex(this.props.replyListIds);
        if (visibleStopIndex != null) {
            return visibleStopIndex < newMessagesSeparatorIndex;
        }
        return false;
    };

    renderToast = (width: number) => {
        const {visibleStopIndex, lastViewedBottom, userScrolledToBottom} = this.state;
        const canShow =
            visibleStopIndex !== 0 &&
            !this.isNewMessagesVisible() &&
            !userScrolledToBottom;

        return (
            <NewRepliesBanner
                threadId={this.props.selected.id}
                lastViewedBottom={lastViewedBottom}
                canShow={canShow}
                onDismiss={this.handleToastDismiss}
                width={width}
                onClick={this.handleToastClick}
            />
        );
    };

    render() {
        const {topRhsPostId, innerRefHeight, postCreateContainerRefHeight} = this.state;

        return (
            <div className='virtual-list__ctr'>
                {this.props.isMobileView && topRhsPostId && !this.props.useRelativeTimestamp && (
                    <FloatingTimestamp
                        isRhsPost={true}
                        isScrolling={this.state.isScrolling}
                        postId={topRhsPostId}
                    />
                )}
                <div
                    role='application'
                    aria-label={Utils.localizeMessage({id: 'accessibility.sections.rhsContent', defaultMessage: 'message details complimentary region'})}
                    className='post-right__content a11y__region'
                    style={{height: '100%', position: 'relative'}}
                    data-a11y-sort-order='3'
                    data-a11y-focus-child={true}
                    data-a11y-order-reversed={true}
                >
                    <AutoSizer
                        disableWidth={true}
                    >
                        {({width, height: _height}) => {
                            const isAvailableSpaceComputed = innerRefHeight !== 0 && postCreateContainerRefHeight !== 0;

                            const available = _height - (postCreateContainerRefHeight);
                            const desired = innerRefHeight + 8; //ik: Added offset to avoid scrollbar
                            const reachedMax = innerRefHeight && postCreateContainerRefHeight ? desired > available : false;
                            const height = Math.min(desired, available);

                            return (

                                // Ik: tricks to hide the content when size is not correctly computed
                                // we have to draw the content in order to compute it, so no early return
                                <div style={{opacity: isAvailableSpaceComputed ? 1 : 0}}>
                                    <DynamicSizeList
                                        canLoadMorePosts={this.canLoadMorePosts}
                                        height={height}
                                        initRangeToRender={this.initRangeToRender}
                                        initScrollToIndex={this.initScrollToIndex}
                                        innerListStyle={this.getInnerStyles()}
                                        innerRef={this.innerRef}
                                        itemData={this.props.replyListIds}
                                        scrollToFailed={this.handleScrollToFailed}
                                        onItemsRendered={this.onItemsRendered}
                                        onScroll={this.handleScroll}
                                        overscanCountBackward={OVERSCAN_COUNT_BACKWARD}
                                        overscanCountForward={OVERSCAN_COUNT_FORWARD}
                                        ref={this.listRef}
                                        style={{...virtListStyles, height}}
                                        width={width}
                                        className={'post-list__dynamic--RHS'}
                                        correctScrollToBottom={true}
                                    >
                                        {this.renderRow}
                                    </DynamicSizeList>
                                    {this.renderToast(width)}
                                    <div
                                        ref={this.postCreateContainerRef}
                                        className={reachedMax ? 'thread-viewer__composer thread-viewer__composer--fixed' : 'thread-viewer__composer'}
                                    >
                                        <CreateComment
                                            placeholder={this.props.inputPlaceholder}
                                            isThreadView={this.props.isThreadView}
                                            teammate={this.props.directTeammate}
                                            threadId={this.props.selected.id}
                                        />
                                    </div>
                                </div>
                            );
                        }}
                    </AutoSizer>
                </div>
            </div>
        );
    }
}

export default ThreadViewerVirtualized;
