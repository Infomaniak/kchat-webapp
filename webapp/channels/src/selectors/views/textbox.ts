// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig, getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

import type {GlobalState} from 'types/store';

export function showPreviewOnCreateComment(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreateComment;
}

export function showPreviewOnCreatePost(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnCreatePost;
}

export function showPreviewOnEditChannelHeaderModal(state: GlobalState) {
    return state.views.textbox.shouldShowPreviewOnEditChannelHeaderModal;
}

export function isVoiceMessagesEnabled(state: GlobalState): boolean {
    const config = getConfig(state);

    const fileAttachmentsEnabled = config.EnableFileAttachments === 'true';
    const voiceMessageFeatureFlagEnabled = getFeatureFlagValue(state, 'EnableVoiceMessages') === 'true';
    const voiceMessagesEnabled = config.ExperimentalEnableVoiceMessage === 'true';

    return (fileAttachmentsEnabled && voiceMessagesEnabled && voiceMessageFeatureFlagEnabled);
}

export function getVoiceMessageMaxDuration(state: GlobalState): number {
    const config = getConfig(state);
    return parseInt(config.MaxVoiceMessagesDuration as string, 10);
}
