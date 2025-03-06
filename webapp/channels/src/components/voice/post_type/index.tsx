// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    DownloadOutlineIcon,
    CloseIcon,
} from '@infomaniak/compass-icons/components';
import React, {useState, useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Post} from '@mattermost/types/posts';

import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import {
    AudioPlayerState,
    useAudioPlayer,
} from 'components/common/hooks/useAudioPlayer';
import * as Menu from 'components/menu';
import TranscriptSpinner from 'components/widgets/loading/loading_transcript_spinner';

import {convertSecondsToMSS} from 'utils/datetime';

export interface Props {
    post?: Post;
    isPreview?: boolean;
    fileId?: string;
    onCancel?: () => void;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {post} = props;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (post?.metadata && post.metadata.files && post.metadata.files.length > 0) {
            setIsLoading(false);
        }
    }, [post?.metadata]);

    const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
    const [showFullTranscript, setShowFullTranscript] = useState(false);
    const fileId = props.fileId ? props.fileId : post?.file_ids![0]; // There is always one file id for type voice.
    const transcript = (props.fileId || isLoading) ? null : post?.metadata?.files[0]?.transcript;
    const {formatMessage} = useIntl();
    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(fileId ? `/api/v4/files/${fileId}` : '');
    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);

    function downloadFile() {
        if (!fileId) {
            return;
        }
        window.location.assign(getFileDownloadUrl(fileId));
    }

    const toggleTranscriptModal = () => {
        setIsTranscriptOpen(!isTranscriptOpen);
    };

    const handleTranscriptClick = () => {
        if (typeof transcript === 'object') {
            toggleTranscriptModal();
        }
    };

    const transcriptReady = (
        <FormattedMessage
            id='vocals.transcript_title'
            defaultMessage='Audio Transcript (auto-generated)'
        />
    );

    const loadingMessage = (
        <FormattedMessage
            id='vocals.transcript_loading'
            defaultMessage='Audio transcription in progress..'
        />
    );

    const toggle = (
        <button
            key='toggle'
            className='style--none single-image-view__toggle'
            aria-label='Toggle Embed Visibility'
            onClick={toggleTranscriptModal}
        >
            {!props.fileId && (
                isLoading ? (
                    <div style={{paddingRight: '3px'}}>
                        <TranscriptSpinner/>
                    </div>
                ) : (
                    <span className={`icon ${(isTranscriptOpen) ? 'icon-menu-down' : 'icon-menu-right'}`}/>
                )
            )}
        </button>
    );

    const transcriptHeader = (
        ((!props.isPreview && transcript?.text?.length !== 0 && transcript?.text?.length !== undefined) || (isLoading && !props.isPreview)) && (
            <div
                className='image-header transcript'
                onClick={handleTranscriptClick}
            >
                {toggle}
                <div
                    data-testid='image-name'
                    className='image-name'
                >
                    <div id='image-name-text'>
                        {props.isPreview ? null : (
                            <>
                                {isLoading && !props.fileId ? (
                                    loadingMessage
                                ) : (
                                    transcriptReady
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    );

    return (
        <>
            <div className='post-image__column post-image__column--audio'>
                <div className='post-image__thumbnail'>
                    <div
                        className='post-image__icon-background'
                        onClick={togglePlayPause}
                    >
                        {playerState === AudioPlayerState.Playing ? (
                            <PauseIcon
                                size={24}
                                color='var(--button-bg)'
                            />
                        ) : (
                            <PlayIcon
                                size={24}
                                color='var(--button-bg)'
                            />
                        )}
                    </div>
                </div>
                <div className='post-image__details'>
                    <div className='post-image__detail_wrapper'>
                        <div className='post-image__detail'>
                            <div className='temp__audio-seeker'>
                                <progress
                                    value={progressValue}
                                    max='1'
                                />
                            </div>
                        </div>
                    </div>
                    <div className='post-image__elapsed-time'>
                        {playerState === AudioPlayerState.Playing || playerState === AudioPlayerState.Paused ? convertSecondsToMSS(elapsed) : convertSecondsToMSS(duration)}
                    </div>
                    {props.post && (
                        <Menu.Container
                            menu={{id: 'dropdown-menu-dotmenu',
                                transformOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                            menuButton={{
                                id: 'post-image-end-button',
                                'aria-label': formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'}),
                                class: 'post-image__end-button',
                                children: (
                                    <DotsVerticalIcon
                                        size={18}
                                        color='currentColor'
                                    />),
                            }}
                        >
                            <Menu.Item
                                id={`download_${post?.id}`}
                                leadingElement={(
                                    <DownloadOutlineIcon
                                        size={18}
                                        color='currentColor'
                                    />)}
                                labels={(
                                    <FormattedMessage
                                        id='single_image_view.download_tooltip'
                                        defaultMessage='Download'
                                    />
                                )}
                                onClick={downloadFile}
                            />
                        </Menu.Container>
                    )}
                    {props.isPreview && (
                        <button
                            className='post-image__end-button'
                            onClick={props.onCancel}
                        >
                            <CloseIcon
                                size={18}
                                color='currentColor'
                            />
                        </button>
                    )}
                </div>
            </div>
            <div>
                <div>
                    <div className='file-view--single'>
                        <div className='file__image'>
                            {transcriptHeader}
                        </div>
                    </div>
                    {!props.isPreview && !isLoading && (
                        <div >
                            <>
                                {typeof transcript === 'object' && transcript && transcript.text && transcript.text.length !== 0 && isTranscriptOpen && (
                                    <div style={{paddingTop: '5px'}}>
                                        {showFullTranscript || transcript.text.length <= 300 ? (
                                            `${transcript.text} `
                                        ) : (
                                            <>
                                                {transcript.text.substring(0, 300)}{'... '}
                                                <a
                                                    onClick={() => {
                                                        setShowFullTranscript(true);
                                                    }}
                                                >
                                                    <FormattedMessage
                                                        id={'vocals.loading_transcript'}
                                                        defaultMessage={'Afficher plus'}
                                                    />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        </div>
                    ) }
                </div>
            </div>
        </>
    );
}

export default VoiceMessageAttachmentPlayer;
