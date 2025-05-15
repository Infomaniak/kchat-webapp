import React, {useState} from 'react';

import type {Channel} from '@mattermost/types/channels';
import type {ServerError} from '@mattermost/types/errors';
import type {FileInfo} from '@mattermost/types/files';

import FilePreview from 'components/file_preview';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';

import Constants, {Locations} from 'utils/constants';
import {getVoiceMessageStateFromDraft, VoiceMessageStates} from 'utils/post_utils';

import type {PostDraft} from 'types/store/draft';

import VoiceMessageAttachment from './voice_message_attachment';
import VoiceMessageButton from './voice_message_button';

const useVoiceMessage = (
    draft: PostDraft,
    channelId: string,
    postId: string,
    readOnlyChannel: boolean,
    location: string,
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void,
    serverError: (ServerError & { submittedMessage?: string | undefined }) | null,
    uploadsProgressPercent: { [clientID: string]: FilePreviewInfo },
    handleUploadProgress: (filePreviewInfo: FilePreviewInfo) => void,
    handleFileUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: string, rootId?: string) => void,
    handleUploadError: (uploadError: string | ServerError | null, clientId?: string, channelId?: string, rootId?: string) => void,
    removePreview: (clientId: string) => void,
    emitTypingEvent: (eventType?: string) => void,
) => {
    const [voiceMessageClientId, setVoiceMessageClientId] = useState('');
    const voiceMessageState = getVoiceMessageStateFromDraft(draft);

    const handleVoiceMessageUploadStart = (clientId: string) => {
        const uploadsInProgress = [...draft.uploadsInProgress, clientId];
        const newDraft = {
            ...draft,
            uploadsInProgress,
            postType: Constants.PostTypes.VOICE as PostDraft['postType'],
        };

        handleDraftChange(newDraft);
        setVoiceMessageClientId(clientId);
    };

    const setDraftAsPostType = (channelId: Channel['id'], draft: PostDraft, postType?: PostDraft['postType']) => {
        if (postType) {
            handleDraftChange({...draft, postType: Constants.PostTypes.VOICE as PostDraft['postType']});
        } else {
            handleDraftChange({...draft, fileInfos: [], uploadsInProgress: [], postType: ''});
        }
    };

    const hasDraftMessagesOrFileAttachments = draft.fileInfos.length !== 0 || draft.uploadsInProgress.length !== 0;

    const voiceMessageJSX = !readOnlyChannel && (location === Locations.CENTER || location === Locations.RHS_COMMENT) ? (
        <VoiceMessageButton
            channelId={channelId}
            rootId={postId}
            location={location}
            draft={draft}
            disabled={readOnlyChannel || Boolean(draft.message.trim().length || draft.fileInfos.length) ||
                voiceMessageState === VoiceMessageStates.RECORDING ||
                voiceMessageState === VoiceMessageStates.UPLOADING || voiceMessageState === VoiceMessageStates.ATTACHED ||
                hasDraftMessagesOrFileAttachments}
            onClick={setDraftAsPostType}
        />
    ) : null;

    let voiceAttachmentPreview = null;
    if (!readOnlyChannel && draft.postType === Constants.PostTypes.VOICE) {
        voiceAttachmentPreview = (
            <div>
                <VoiceMessageAttachment
                    channelId={channelId}
                    rootId={postId}
                    draft={draft}
                    location={location}
                    vmState={voiceMessageState}
                    setDraftAsPostType={setDraftAsPostType}
                    uploadingClientId={voiceMessageClientId}
                    didUploadFail={Boolean(serverError)}
                    onUploadStart={handleVoiceMessageUploadStart}
                    uploadProgress={uploadsProgressPercent?.[voiceMessageClientId]?.percent ?? 0}
                    onUploadProgress={handleUploadProgress}
                    onUploadComplete={handleFileUploadComplete}
                    onUploadError={handleUploadError}
                    onRemoveDraft={removePreview}
                    onSubmit={handleFileUploadComplete as () => void}
                    onStarted={emitTypingEvent}
                    onCancel={emitTypingEvent}
                    onComplete={emitTypingEvent}
                />
            </div>
        );
    } else if (!readOnlyChannel && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
        voiceAttachmentPreview = (
            <FilePreview
                fileInfos={draft.fileInfos}
                onRemove={removePreview}
                uploadsInProgress={draft.uploadsInProgress}
                uploadsProgressPercent={uploadsProgressPercent}
            />
        );
    }

    return [voiceMessageJSX, voiceAttachmentPreview];
};

export default useVoiceMessage;
