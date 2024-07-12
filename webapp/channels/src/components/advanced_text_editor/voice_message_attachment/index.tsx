// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ComponentProps, FormEvent} from 'react';
import React, {memo, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';
import type {ServerError} from '@mattermost/types/errors';
import type {FileInfo, FileUploadResponse} from '@mattermost/types/files';
import type {Post} from '@mattermost/types/posts';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {uploadFile} from 'actions/file_actions';

import VoiceMessageRecordingStarted from 'components/advanced_text_editor/voice_message_attachment/components/recording_started';
import VoiceMessageUploadingFailed from 'components/advanced_text_editor/voice_message_attachment/components/upload_failed';
import VoiceMessageUploadingStarted from 'components/advanced_text_editor/voice_message_attachment/components/upload_started';
import type {FilePreviewInfo} from 'components/file_preview/file_preview';
import VoiceMessageAttachmentPlayer from 'components/voice_message_attachment_player';

import {AudioFileExtensions, Locations} from 'utils/constants';
import {VoiceMessageStates} from 'utils/post_utils';
import {generateId} from 'utils/utils';

import type {PostDraft} from 'types/store/draft';

declare global {
    interface Window {
        webkitAudioContext: AudioContext;
    }
}

type Props = {
    channelId: Channel['id'];
    rootId: Post['id'];
    draft: PostDraft;
    location: string;
    vmState: VoiceMessageStates;
    didUploadFail: boolean;
    uploadingClientId: string;
    setDraftAsPostType: (channelOrRootId: Channel['id'] | Post['id'], draft: PostDraft) => void;
    onUploadStart: (clientIds: string, channelOrRootId: Channel['id'] | Post['id']) => void;
    uploadProgress: number;
    onUploadProgress: (filePreviewInfo: FilePreviewInfo) => void;
    onUploadComplete: (fileInfos: FileInfo[], clientIds: string[], channelId: Channel['id'], rootId?: Post['id']) => void;
    onUploadError: (err: string | ServerError, clientId?: string, channelId?: Channel['id'], rootId?: Post['id']) => void;
    onRemoveDraft: (fileInfoIdOrClientId: FileInfo['id'] | string) => void;
    onSubmit: (e: FormEvent<Element>) => void;
    onComplete?: (type: string) => void;
    onCancel?: (type: string) => void;
    onStarted?: (type: string) => void;
}

const VoiceMessageAttachment = (props: Props) => {
    const theme = useSelector(getTheme);

    const dispatch = useDispatch();

    const xmlRequestRef = useRef<XMLHttpRequest>();

    const audioFileRef = useRef<File>();

    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (props.vmState === VoiceMessageStates.ATTACHED) {
            function handleKeyDown(e: KeyboardEvent) {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                    e.preventDefault();
                    props.onSubmit(e as unknown as FormEvent<Element>);
                }
            }

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [props?.draft?.fileInfos?.[0]?.id, props.vmState]);

    function handleOnUploadComplete(data: FileUploadResponse | undefined, channelId: string, rootId: string) {
        if (data) {
            props.onUploadComplete(data.file_infos, data.client_ids, channelId, rootId);
        }
    }

    function uploadRecording(recordedAudioFile: File) {
        const clientId = generateId();

        xmlRequestRef.current = dispatch(uploadFile({
            file: recordedAudioFile,
            name: recordedAudioFile.name,
            type: AudioFileExtensions.MP3,
            rootId: props.rootId || '',
            channelId: props.channelId,
            clientId,
            onProgress: props.onUploadProgress,
            onSuccess: handleOnUploadComplete,
            onError: props.onUploadError,
        })) as unknown as XMLHttpRequest;

        if (props.location === Locations.CENTER) {
            props.onUploadStart(clientId, props.channelId);
        }
        if (props.location === Locations.RHS_COMMENT) {
            props.onUploadStart(clientId, props.rootId);
        }
    }

    function handleUploadRetryClicked() {
        if (audioFileRef.current) {
            uploadRecording(audioFileRef.current);
        }
    }

    function handleRemoveBeforeUpload() {
        if (xmlRequestRef.current) {
            xmlRequestRef.current.abort();
        }

        props.onRemoveDraft(props.uploadingClientId);
    }

    function handleRemoveAfterUpload() {
        const audioFileId = props.draft?.fileInfos?.[0]?.id ?? '';
        if (audioFileId) {
            props.onRemoveDraft(audioFileId);
        }
    }

    async function handleCompleteRecordingClicked(audioFile: File) {
        audioFileRef.current = audioFile;
        uploadRecording(audioFile);
        props.onComplete?.('stop');
    }

    function handleCancelRecordingClicked() {
        if (props.location === Locations.CENTER) {
            props.setDraftAsPostType(props.channelId, props.draft);
        }
        if (props.location === Locations.RHS_COMMENT) {
            props.setDraftAsPostType(props.rootId, props.draft);
        }
        props.onCancel?.('stop');
    }

    if (props.vmState === VoiceMessageStates.RECORDING) {
        return (
            <VoiceMessageRecordingStarted
                theme={theme}
                onCancel={handleCancelRecordingClicked}
                onComplete={handleCompleteRecordingClicked}
                onStarted={props.onStarted}
            />
        );
    }

    if (props.vmState === VoiceMessageStates.UPLOADING) {
        return (
            <VoiceMessageUploadingStarted
                theme={theme}
                progress={props.uploadProgress}
                onCancel={handleRemoveBeforeUpload}
            />
        );
    }

    if (props.didUploadFail) {
        return (
            <VoiceMessageUploadingFailed
                recordedAudio={audioFileRef.current}
                onRetry={handleUploadRetryClicked}
                onCancel={handleRemoveAfterUpload}
            />
        );
    }

    if (props.vmState === VoiceMessageStates.ATTACHED) {
        const src = props?.draft?.fileInfos?.[0]?.id ?? '';

        return (
            <div className='file-preview__container'>
                <VoiceMessageAttachmentPlayer
                    fileId={src}
                    onCancel={handleRemoveAfterUpload}
                    isPreview={true}
                />
            </div>
        );
    }

    return null;
};

export default memo(VoiceMessageAttachment);
