// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {lazy} from 'react';
import {FormattedMessage} from 'react-intl';
import type {RouteComponentProps} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';

import AdvancedCreatePost from 'components/advanced_create_post';
import {makeAsyncComponent} from 'components/async_load';
import {BannerJoinChannel} from 'components/banner_join_channel';
import deferComponentRender from 'components/deferComponentRender';
import FileUploadOverlay from 'components/file_upload_overlay';
import {DropOverlayIdCenterChannel} from 'components/file_upload_overlay/file_upload_overlay';
import PostView from 'components/post_view';

import WebSocketClient from 'client/web_websocket_client';

import type {PropsFromRedux} from './index';

const ChannelHeader = makeAsyncComponent('ChannelHeader', lazy(() => import('components/channel_header')));

// IK changes : we also need to not lazy load the file upload overlay component otherwise drag and drop will not work
// const FileUploadOverlay = makeAsyncComponent('FileUploadOverlay', lazy(() => import('components/file_upload_overlay')));
const ChannelBookmarks = makeAsyncComponent('ChannelBookmarks', lazy(() => import('components/channel_bookmarks')));

// IK changes : we choose to not lazy load the advanced create post component due to missingChannelRole being always false
// const AdvancedCreatePost = makeAsyncComponent('AdvancedCreatePost', lazy(() => import('components/advanced_create_post')));

export type Props = PropsFromRedux & RouteComponentProps<{
    postid?: string;
    channel?: string | undefined;
}>;

type State = {
    channelId: string;
    url: string;
    focusedPostId?: string;
    deferredPostView: any;
    waitForLoader: boolean;
};

export default class ChannelView extends React.PureComponent<Props, State> {
    public static createDeferredPostView = () => {
        return deferComponentRender(
            PostView,
            <div
                id='post-list'
                className='a11y__region'
                data-a11y-sort-order='1'
                data-a11y-focus-child={true}
                data-a11y-order-reversed={true}
            />,
        );
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        let updatedState = {};
        const focusedPostId = props.match.params.postid;

        if (props.match.url !== state.url && props.channelId !== state.channelId) {
            updatedState = {deferredPostView: ChannelView.createDeferredPostView(), url: props.match.url, focusedPostId};
        }

        if (props.channelId !== state.channelId) {
            updatedState = {...updatedState, channelId: props.channelId, focusedPostId};
        }

        if (focusedPostId && focusedPostId !== state.focusedPostId) {
            updatedState = {...updatedState, focusedPostId};
        }

        if (Object.keys(updatedState).length) {
            return updatedState;
        }

        return null;
    }

    channelViewRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            url: props.match.url,
            channelId: props.channelId,
            focusedPostId: props.match.params.postid,
            deferredPostView: ChannelView.createDeferredPostView(),
            waitForLoader: false,
        };

        this.channelViewRef = React.createRef();
    }

    onClickCloseChannel = () => {
        this.props.goToLastViewedChannel();
    };

    componentDidUpdate(prevProps: Props) {
        // TODO: debounce
        if (prevProps.channelId !== this.props.channelId && this.props.enableWebSocketEventScope) {
            // WebSocketClient.updateActiveChannel();
        }
        if (prevProps.channelId !== this.props.channelId || prevProps.channelIsArchived !== this.props.channelIsArchived) {
            if (this.props.channelIsArchived && !this.props.viewArchivedChannels) {
                this.props.goToLastViewedChannel();
            }
            if (prevProps.channelId) {
                WebSocketClient.unbindPresenceChannel(prevProps.channelId);
            }
            if (this.props.channelId && !this.props.deactivatedChannel && !this.props.channelIsArchived) {
                WebSocketClient.bindPresenceChannel(this.props.channelId);
            }
        }
    }

    render() {
        let createPost;
        if (this.props.deactivatedChannel) {
            createPost = (
                <div
                    className='post-create__container AdvancedTextEditor__ctr'
                    id='post-create'
                    data-testid='post-create'
                >
                    <div
                        className='channel-archived__message'
                    >
                        <FormattedMessage
                            id='channelView.archivedChannelWithDeactivatedUser'
                            defaultMessage='You are viewing an archived channel with a <b>deactivated user</b>. New messages cannot be posted.'
                            values={{
                                b: (chunks: string) => <b>{chunks}</b>,
                            }}
                        />
                        <button
                            className='btn btn-primary channel-archived__close-btn'
                            onClick={this.onClickCloseChannel}
                        >
                            <FormattedMessage
                                id='center_panel.archived.closeChannel'
                                defaultMessage='Close Channel'
                            />
                        </button>
                    </div>
                </div>
            );
        } else if (this.props.channelIsArchived) {
            createPost = (
                <div
                    className='post-create__container'
                    id='post-create'
                    data-testid='post-create'
                >
                    <div
                        id='channelArchivedMessage'
                        className='channel-archived__message'
                    >
                        <FormattedMessage
                            id='channelView.archivedChannel'
                            defaultMessage='You are viewing an <b>archived channel</b>. New messages cannot be posted.'
                            values={{
                                b: (chunks: string) => <b>{chunks}</b>,
                            }}
                        />
                        <button
                            className='btn btn-primary channel-archived__close-btn'
                            onClick={this.onClickCloseChannel}
                        >
                            <FormattedMessage
                                id='center_panel.archived.closeChannel'
                                defaultMessage='Close Channel'
                            />
                        </button>
                    </div>
                </div>
            );
        } else if (this.props.isMember) {
            createPost = (
                <div
                    className='post-create__container AdvancedTextEditor__ctr'
                    id='post-create'
                    data-testid='post-create'
                >
                    <AdvancedCreatePost/>
                </div>
            );
        } else if (this.props.channel?.type !== 'P' && this.props.channel) {
            createPost = (
                <BannerJoinChannel
                    onButtonClick={() => GlobalActions.joinChannel(this.props.channelId)}
                />
            );
        } else {
            createPost = null;
        }

        const DeferredPostView = this.state.deferredPostView;

        return (
            <div
                ref={this.channelViewRef}
                id='app-content'
                className='app__content'
            >
                <FileUploadOverlay
                    overlayType='center'
                    id={DropOverlayIdCenterChannel}
                />
                <ChannelHeader {...this.props}/>
                {this.props.isChannelBookmarksEnabled && <ChannelBookmarks channelId={this.props.channelId}/>}
                <DeferredPostView
                    channelId={this.props.channelId}
                    focusedPostId={this.state.focusedPostId}
                />
                {createPost}
            </div>
        );
    }
}
