import React, {useState} from 'react';
import type {PostDraft} from 'types/store/draft';
import Constants, {Locations} from 'utils/constants';
import {getVoiceMessageStateFromDraft, VoiceMessageStates} from 'utils/post_utils';
import VoiceMessageButton from './voice_message_button';
import type {ServerError} from '@mattermost/types/errors';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import VoiceMessageAttachment from './voice_message_attachment';
import FilePreview from 'components/file_preview';
import {Channel} from '@mattermost/types/channels';

const useVoiceMessage = (
    draft: PostDraft,
    channelId: string,
    postId: string,
    readOnlyChannel: boolean,
    location: string,
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void,
    serverError: ServerError,
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo},
    handleUploadProgress: () => void,
    handleFileUploadComplete: () => void,
    handleUploadError: () => void,
    removePreview: () => void,
    emitTypingEvent: (eventType?: string) => void,
) => {
    const [voiceMessageClientId, setVoiceMessageClientId] = useState('')
    const voiceMessageState = getVoiceMessageStateFromDraft(draft);
    console.log('use_voice_message voiceMessageState', voiceMessageState)

    const handleVoiceMessageUploadStart = (clientId: string, channelId: Channel['id']) => {
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
            handleDraftChange({...draft, fileInfos: [], uploadsInProgress: [], postType: ''})
        }
    };

    const hasDraftMessagesOrFileAttachments = draft.fileInfos.length !== 0 || draft.uploadsInProgress.length !== 0;

    const voiceMessageJSX = !readOnlyChannel && (location === Locations.CENTER || location === Locations.RHS_COMMENT) ? (
        <VoiceMessageButton
            channelId={channelId}
            rootId={postId}
            location={location}
            draft={draft}
            disabled={readOnlyChannel ||
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
                    onSubmit={handleFileUploadComplete}
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

    return [voiceMessageClientId, handleVoiceMessageUploadStart, voiceMessageJSX, voiceAttachmentPreview]
}

export default useVoiceMessage;
