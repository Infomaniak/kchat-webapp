// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {MicrophoneOutlineIcon, CloseIcon, CheckIcon} from '@mattermost/compass-icons/components';

import type {Theme} from 'mattermost-redux/selectors/entities/preferences';

import {getVoiceMessageMaxDuration} from 'selectors/views/textbox';

import {
    AttachmentRootContainer,
    CancelButton,
    OkButton,
    Duration,
} from 'components/advanced_text_editor/voice_message_attachment/components/file_attachment_containers';
import VoiceMessageRecordingFailed from 'components/advanced_text_editor/voice_message_attachment/components/recording_failed';
import {useAudioRecorder} from 'components/common/hooks/useAudioRecorder';

import {convertSecondsToMSS} from 'utils/datetime';

interface Props {
    theme: Theme;
    onCancel: (type: string) => void;
    onComplete: (audioFile: File, type: string) => Promise<void>;
    onStarted?: (type: string) => void;
}

function VoiceMessageRecordingStarted(props: Props) {
    const voiceMessageMaxDuration = useSelector(getVoiceMessageMaxDuration);

    const canvasElemRef = useRef<HTMLCanvasElement>(null);

    const {startRecording, elapsedTime, stopRecording, cleanPostRecording, hasError} = useAudioRecorder({
        canvasElemRef,
        canvasBg: props.theme.centerChannelBg,
        canvasBarColor: props.theme.buttonBg,
        canvasBarWidth: 4,
        audioAnalyzerFFTSize: 32,
        minimumAmplitudePercentage: 20,
        reducedSampleSize: 13,
        audioFilePrefix: 'voice_message_',
    });

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                handleRecordingComplete();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        startRecording();
        if (typeof props.onStarted === 'function') {
            props.onStarted('recording');
        }

        return () => {
            cleanPostRecording(true);
        };
    }, []);

    async function handleRecordingCancelled() {
        await cleanPostRecording(true);
        props.onCancel('stop');
    }

    async function handleRecordingComplete() {
        const audioFile = await stopRecording();

        if (audioFile) {
            props.onComplete(audioFile, 'stop');
        }
    }

    useEffect(() => {
        if (elapsedTime >= voiceMessageMaxDuration) {
            handleRecordingComplete();
        }
    }, [elapsedTime, voiceMessageMaxDuration]);

    if (hasError) {
        return <VoiceMessageRecordingFailed onCancel={handleRecordingCancelled}/>;
    }

    return (
        <AttachmentRootContainer
            icon={(
                <MicrophoneOutlineIcon
                    size={24}
                    color={props.theme.buttonBg}
                />
            )}
        >
            <VisualizerContainer>
                <Canvas ref={canvasElemRef}>
                    <FormattedMessage
                        id='voiceMessage.canvasFallback.recording'
                        defaultMessage='Recording started'
                    />
                </Canvas>
            </VisualizerContainer>
            <Duration>
                {convertSecondsToMSS(elapsedTime)}
            </Duration>
            <CancelButton onClick={handleRecordingCancelled}>
                <CloseIcon size={18}/>
            </CancelButton>
            <OkButton onClick={handleRecordingComplete}>
                <CheckIcon
                    size={18}
                    color={props.theme.buttonColor}
                />
            </OkButton>
        </AttachmentRootContainer>
    );
}

export const VisualizerContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 1rem;
`;

const Canvas = styled.canvas`
    width: 100%;
    height: 24px;
`;

export default VoiceMessageRecordingStarted;
