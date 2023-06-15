// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import type {GlobalState} from '@mattermost/types/store';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import type {Draft} from 'selectors/drafts';

import ChannelDraft from './channel_draft';
import ThreadDraft from './thread_draft';

type Props = {
    user: UserProfile;
    status: UserStatus['status'];
    displayName: string;
    draft: Draft;
}

function DraftRow({draft, user, status, displayName}: Props) {
    const currentTeamId = useSelector(getCurrentTeamId);
    const isScheduled = Boolean(draft.value.timestamp);
    const scheduledWillNotBeSent = useSelector((state: GlobalState) => !haveIChannelPermission(state, currentTeamId, draft.value.channelId, Permissions.CREATE_POST)) && isScheduled;
    switch (draft.type) {
    case 'channel':
        return (
            <ChannelDraft
                {...draft}
                draftId={String(draft.key)}
                user={user}
                status={status}
                displayName={displayName}
                isScheduled={isScheduled}
                scheduledWillNotBeSent={scheduledWillNotBeSent}
            />
        );
    case 'thread':
        return (
            <ThreadDraft
                {...draft}
                rootId={draft.id}
                draftId={String(draft.key)}
                user={user}
                status={status}
                displayName={displayName}
                isScheduled={isScheduled}
                scheduledWillNotBeSent={scheduledWillNotBeSent}
            />
        );
    default:
        return null;
    }
}

export default memo(DraftRow);
