import React, {useState} from 'react';
import type {PostDraft} from 'types/store/draft';
import Constants, {Locations} from 'utils/constants';
import {getVoiceMessageStateFromDraft, VoiceMessageStates} from 'utils/post_utils';
import VoiceMessageButton from './voice_message_button';
import type {ServerError} from '@mattermost/types/errors';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import VoiceMessageAttachment from './voice_message_attachment';

const useVoiceMessage = (
    draft: PostDraft,
    channelId: string,
    postId: string,
    readOnlyChannel: boolean,
    location,
    handleDraftChange: (draft: PostDraft, options?: {instant?: boolean; show?: boolean}) => void,
    serverError: ServerError,
    uploadsProgressPercent: {[clientID: string]: FilePreviewInfo},
    handleUploadProgress: () => void,
    handleFileUploadComplete: () => void,
    handleUploadError: () => void,
    removePreview: () => void,
) => {
    const [voiceMessageClientId, setVoiceMessageClientId] = useState('')
    const voiceMessageState = getVoiceMessageStateFromDraft(draft);

    const handleSubmit = () => {
        const key = rootId || channelId;
        const draftToUpdate = draft;
        if (!draftToUpdate) {
            return;
        }

        const newFileInfos = sortFileInfos([...draftToUpdate.fileInfos || [], ...fileInfos], locale);

        // const clientIdsSet = new Set(clientIds);
        // const uploadsInProgress = (draftToUpdate.uploadsInProgress || []).filter((v) => !clientIdsSet.has(v));

        const modifiedDraft = {
            ...draftToUpdate,
            fileInfos: newFileInfos,
            // uploadsInProgress,
        };

        handleDraftChange(modifiedDraft, {instant: true});
    }

    const handleVoiceMessageUploadStart = (clientId: string, channelId: Channel['id']) => {
        const uploadsInProgress = [...draft.uploadsInProgress, clientId];
        const draft = {
            ...draft,
            uploadsInProgress,
            postType: Constants.PostTypes.VOICE,
        };

        handleDraftChange(draft);
        setVoiceMessageClientId(clientId);
    };

    const setDraftAsPostType = (channelId: Channel['id'], draft: PostDraft, postType?: PostDraft['postType']) => {
        if (postType) {
            const updatedDraft: PostDraft = {...draft, postType: Constants.PostTypes.VOICE};
            handleDraftChange(updatedDraft);
        } else {
            handleDraftChange(null);
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

    let attachmentPreview = null;
    if (!readOnlyChannel && draft.postType === Constants.PostTypes.VOICE) {
        attachmentPreview = (
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
                    onSubmit={handleSubmit}
                />
            </div>
        );
    } else if (!readOnlyChannel && (draft.fileInfos.length > 0 || draft.uploadsInProgress.length > 0)) {
        attachmentPreview = (
            <FilePreview
                fileInfos={draft.fileInfos}
                onRemove={removePreview}
                uploadsInProgress={draft.uploadsInProgress}
                uploadsProgressPercent={uploadsProgressPercent}
            />
        );
    }

    return [voiceMessageClientId, handleVoiceMessageUploadStart, voiceMessageJSX]
}

export default useVoiceMessage;
