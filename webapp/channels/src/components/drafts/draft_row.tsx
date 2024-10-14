// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import noop from 'lodash/noop';
import React, {memo, useCallback, useMemo, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import type {ServerError} from '@mattermost/types/errors';
import type {FileInfo} from '@mattermost/types/files';
import type {ScheduledPost} from '@mattermost/types/schedule_post';
import type {UserProfile, UserStatus} from '@mattermost/types/users';

import {getPost as getPostAction} from 'mattermost-redux/actions/posts';
import {deleteScheduledPost, updateScheduledPost} from 'mattermost-redux/actions/scheduled_posts';
import {Permissions} from 'mattermost-redux/constants';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {makeGetThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';

import {removeDraft} from 'actions/views/drafts';
import {selectPostById} from 'actions/views/rhs';
import {getConnectionId} from 'selectors/general';
import {getChannelURL} from 'selectors/urls';

import usePriority from 'components/advanced_text_editor/use_priority';
import useSubmit from 'components/advanced_text_editor/use_submit';
import ScheduledPostActions from 'components/drafts/draft_actions/schedule_post_actions/scheduled_post_actions';

import Constants, {StoragePrefixes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

import DraftActions from './draft_actions';
import DraftTitle from './draft_title';
import Panel from './panel/panel';
import PanelBody from './panel/panel_body';
import Header from './panel/panel_header';
import {getErrorStringFromCode} from './utils';

type Props = {
    user: UserProfile;
    status: UserStatus['status'];
    displayName: string;
    item: PostDraft | ScheduledPost;
    isRemote?: boolean;
}

const mockLastBlurAt = {current: 0};

function DraftRow({
    item,
    user,
    status,
    displayName,
    isRemote,
}: Props) {
    const intl = useIntl();

    const rootId = ('rootId' in item) ? item.rootId : item.root_id;
    const channelId = ('channelId' in item) ? item.channelId : item.channel_id;

    const [serverError, setServerError] = useState<(ServerError & { submittedMessage?: string }) | null>(null);

    const history = useHistory();
    const dispatch = useDispatch();

    const getChannel = useMemo(() => makeGetChannel(), []);
    const getThreadOrSynthetic = useMemo(() => makeGetThreadOrSynthetic(), []);

    const rootPostDeleted = useSelector((state: GlobalState) => {
        if (!rootId) {
            return false;
        }
        const rootPost = getPost(state, rootId);
        return !rootPost || rootPost.delete_at > 0 || rootPost.state === 'DELETED';
    });

    const tooLong = useSelector((state: GlobalState) => {
        const maxPostSize = parseInt(getConfig(state).MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT;
        return item.message.length > maxPostSize;
    });

    const readOnly = !useSelector((state: GlobalState) => {
        const channel = getChannel(state, channelId);
        return channel ? haveIChannelPermission(state, channel.team_id, channel.id, Permissions.CREATE_POST) : false;
    });

    const connectionId = useSelector(getConnectionId);

    let postError = '';

    if ('scheduled_at' in item) {
        // This is applicable only for scheduled post.
        if (item.error_code) {
            postError = getErrorStringFromCode(intl, item.error_code);
        }
    } else if (rootPostDeleted) {
        postError = intl.formatMessage({id: 'drafts.error.post_not_found', defaultMessage: 'Thread not found'});
    } else if (tooLong) {
        postError = intl.formatMessage({id: 'drafts.error.too_long', defaultMessage: 'Message too long'});
    } else if (readOnly) {
        postError = intl.formatMessage({id: 'drafts.error.read_only', defaultMessage: 'Channel is read only'});
    }

    const canSend = !postError;
    const canEdit = !(rootPostDeleted || readOnly);

    const channel = useSelector((state: GlobalState) => getChannel(state, channelId));
    const channelUrl = useSelector((state: GlobalState) => {
        if (!channel) {
            return '';
        }

        const teamId = getCurrentTeamId(state);
        return getChannelURL(state, channel, teamId);
    });

    const goToMessage = useCallback(async () => {
        if (rootId) {
            if (rootPostDeleted) {
                return;
            }
            await dispatch(selectPostById(rootId));
            return;
        }
        history.push(channelUrl);
    }, [channelUrl, dispatch, history, rootId, rootPostDeleted]);

    // TODO LOL verify the types and handled it better
    const {onSubmitCheck: prioritySubmitCheck} = usePriority(item as any, noop, noop, false);
    const [handleOnSend] = useSubmit(
        item as any,
        postError,
        channelId,
        rootId,
        serverError,
        mockLastBlurAt,
        noop,
        setServerError,
        noop,
        noop,
        prioritySubmitCheck,
        goToMessage,
        undefined,
        true,
    );

    const thread = useSelector((state: GlobalState) => {
        if (!rootId) {
            return undefined;
        }
        const post = getPost(state, rootId);
        if (!post) {
            return undefined;
        }

        return getThreadOrSynthetic(state, post);
    });

    const handleOnDelete = useCallback(() => {
        let key = `${StoragePrefixes.DRAFT}${channelId}`;
        if (rootId) {
            key = `${StoragePrefixes.COMMENT_DRAFT}${rootId}`;
        }
        dispatch(removeDraft(key, channelId, rootId));
    }, [dispatch, channelId, rootId]);

    const draftActions = useMemo(() => {
        if (!channel) {
            return null;
        }
        return (
            <DraftActions
                channelDisplayName={channel.display_name}
                channelName={channel.name}
                channelType={channel.type}
                userId={user.id}
                onDelete={handleOnDelete}
                onEdit={goToMessage}
                onSend={handleOnSend}
                canEdit={canEdit}
                canSend={canSend}
            />
        );
    }, [
        canEdit,
        canSend,
        channel,
        goToMessage,
        handleOnDelete,
        handleOnSend,
        user.id,
    ]);

    const handleSchedulePostOnReschedule = useCallback(async (updatedScheduledAtTime: number) => {
        const updatedScheduledPost: ScheduledPost = {
            ...(item as ScheduledPost),
            scheduled_at: updatedScheduledAtTime,
        };

        const result = await dispatch(updateScheduledPost(updatedScheduledPost, connectionId));
        return {
            error: result.error?.message,
        };
    }, [connectionId, dispatch, item]);

    const handleSchedulePostOnDelete = useCallback(async () => {
        const scheduledPostId = (item as ScheduledPost).id;
        const result = await dispatch(deleteScheduledPost(scheduledPostId, connectionId));
        return {
            error: result.error?.message,
        };
    }, [item, dispatch, connectionId]);

    const scheduledPostActions = useMemo(() => {
        if (!channel) {
            return null;
        }

        return (
            <ScheduledPostActions
                scheduledPost={item as ScheduledPost}
                channelDisplayName={channel.display_name}
                onReschedule={handleSchedulePostOnReschedule}
                onDelete={handleSchedulePostOnDelete}
                onSend={() => {}}
            />
        );
    }, [
        channel,
        handleSchedulePostOnDelete,
        handleSchedulePostOnReschedule,
        item,
    ]);

    useEffect(() => {
        if (rootId && !thread?.id) {
            dispatch(getPostAction(rootId));
        }
    }, [thread?.id]);

    if (!channel) {
        return null;
    }

    let timestamp: number;
    let fileInfos: FileInfo[];
    let uploadsInProgress: string[];
    let actions: React.ReactNode;

    if ('scheduled_at' in item) {
        timestamp = item.scheduled_at;
        fileInfos = item.metadata?.files || [];
        uploadsInProgress = [];
        actions = scheduledPostActions;
    } else {
        timestamp = item.updateAt;
        fileInfos = item.fileInfos;
        uploadsInProgress = item.uploadsInProgress;
        actions = draftActions;
    }

    return (
        <Panel
            onClick={goToMessage}
            hasError={Boolean(postError)}
        >
            {({hover}) => (
                <>
                    <Header
                        kind={'scheduled_at' in item ? 'scheduledPost' : 'draft'}
                        hover={hover}
                        actions={actions}
                        title={(
                            <DraftTitle
                                type={(rootId ? 'thread' : 'channel')}
                                channel={channel}
                                userId={user.id}
                            />
                        )}
                        timestamp={timestamp}
                        remote={isRemote || false}
                        error={postError || serverError?.message}
                    />
                    <PanelBody
                        channelId={channel.id}
                        displayName={displayName}
                        fileInfos={fileInfos}
                        message={item.message}
                        status={status}
                        priority={rootId ? undefined : item.metadata?.priority}
                        uploadsInProgress={uploadsInProgress}
                        userId={user.id}
                        username={user.username}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(DraftRow);
