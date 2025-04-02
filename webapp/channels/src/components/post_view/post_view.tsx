// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import LoadingScreen from 'components/loading_screen';

import {Preferences} from 'utils/constants';

import PostList from './post_list';
import { PropsFromRedux } from './index';
import { RouteComponentProps } from 'react-router-dom';


interface Props extends PropsFromRedux, RouteComponentProps {
    lastViewedAt: number;
    channelLoading: boolean;
    channelId: string;
    focusedPostId?: string;
    unreadScrollPosition: string;
    isThreadView?: boolean;
}

interface State {
    unreadChunkTimeStamp: number | undefined;
    loaderForChangeOfPostsChunk: boolean;
    channelLoading: boolean;
    shouldStartFromBottomWhenUnread: boolean;
}

export default class PostView extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        const shouldStartFromBottomWhenUnread = this.props.unreadScrollPosition === Preferences.UNREAD_SCROLL_POSITION_START_FROM_NEWEST;
        this.state = {
            unreadChunkTimeStamp: props.lastViewedAt,
            shouldStartFromBottomWhenUnread,
            loaderForChangeOfPostsChunk: false,
            channelLoading: props.channelLoading,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (state.unreadChunkTimeStamp === null && props.lastViewedAt) {
            return {
                unreadChunkTimeStamp: props.lastViewedAt,
            };
        }
        if (props.channelLoading !== state.channelLoading) {
            return {
                unreadChunkTimeStamp: props.lastViewedAt,
                channelLoading: props.channelLoading,
            };
        }

        return null;
    }

    changeUnreadChunkTimeStamp = (unreadChunkTimeStamp: number) => {
        this.setState({
            unreadChunkTimeStamp,
            loaderForChangeOfPostsChunk: true,
        }, () => {
            window.requestAnimationFrame(() => {
                this.setState({
                    loaderForChangeOfPostsChunk: false,
                });
            });
        });
    };

    toggleShouldStartFromBottomWhenUnread = () => {
        this.setState((state) => ({
            loaderForChangeOfPostsChunk: true,
            shouldStartFromBottomWhenUnread: !state.shouldStartFromBottomWhenUnread,
        }), () => {
            window.requestAnimationFrame(() => {
                this.setState({
                    loaderForChangeOfPostsChunk: false,
                });
            });
        });
    };

    startAutomaticCallIfNeeded = () => {
        const params = new URLSearchParams(this.props.location.search);
        const hasCallParam = params.has('call');
        
        if (hasCallParam) {
            this.props.actions.startCall(this.props.channelId);

            params.delete('call');

            // Keep existing params if there is
            const newUrl = this.props.location.pathname + (params.toString() ? `?${params.toString()}` : '');

            this.props.history.replace(newUrl)
        }
    };



    render() {
        if (this.props.channelLoading || this.state.loaderForChangeOfPostsChunk) {
            return (
                <div id='post-list'>
                    <LoadingScreen centered={true}/>
                </div>
            );
        }

        return (
            <div
                id='post-list'
                role='main'
            >
                <PostList
                    unreadChunkTimeStamp={this.state.unreadChunkTimeStamp}
                    channelId={this.props.channelId}
                    changeUnreadChunkTimeStamp={this.changeUnreadChunkTimeStamp}
                    shouldStartFromBottomWhenUnread={this.state.shouldStartFromBottomWhenUnread}
                    toggleShouldStartFromBottomWhenUnread={this.toggleShouldStartFromBottomWhenUnread}
                    focusedPostId={this.props.focusedPostId}
                    isThreadView={this.props.isThreadView}
                />
            </div>
        );
    }
}
