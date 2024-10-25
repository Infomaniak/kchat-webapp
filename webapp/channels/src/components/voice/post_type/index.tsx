// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    DownloadOutlineIcon,
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
import TranscriptComponent from 'components/transcript/transcript';
import TranscriptSpinner from 'components/widgets/loading/loading_transcript_spinner';

import {convertSecondsToMSS} from 'utils/datetime';

export interface Props {
    post?: Post;
    isPreview?: boolean;
    fileId?: string;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {post} = props;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (post?.metadata && post.metadata.files && post.metadata.files.length > 0) {
            setIsLoading(false);
        }
    }, [post?.metadata]);

    const [anchorEl, setAnchorEl] = React.useState<HTMLAnchorElement | null>(null);
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(true);
    const fileId = props.fileId ? props.fileId : post?.file_ids![0]; // There is always one file id for type voice.
    const transcript = (props.fileId || isLoading) ? null : post?.metadata?.files[0]?.transcript;
    const {formatMessage} = useIntl();
    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(fileId ? `/api/v4/files/${fileId}` : '');
    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);
    const open = Boolean(anchorEl);

    function downloadFile() {
        if (!fileId) {
            return;
        }
        window.location.assign(getFileDownloadUrl(fileId));
    }

    const toggleTranscriptModal = () => {
        setIsTranscriptModalOpen(!isTranscriptModalOpen);
    };

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
                    <span className={`icon ${(isTranscriptModalOpen) ? 'icon-menu-down' : 'icon-menu-right'}`}/>
                )
            )}
        </button>
    );

    const transcriptHeader = (
        <div
            className='image-header'
            style={{cursor: 'pointer', display: 'flex'}}
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
                                {typeof transcript === 'object' && transcript && transcript.text && transcript.text.length !== 0 && isTranscriptModalOpen && (
                                    <div style={{paddingTop: '5px'}}>
                                        {transcript?.text?.length > 300 ? transcript?.text.substring(0, 300) + '... ' : transcript?.text + ' '}
                                        <a
                                            className='transcript-link-view'
                                            onClick={(event) => {
                                                handleClick(event);
                                            }}
                                        >
                                            <FormattedMessage
                                                id={'vocals.loading_transcript'}
                                                defaultMessage={'View the transcript'}
                                            />
                                        </a>
                                    </div>
                                )}
                                {typeof transcript === 'object' && transcript && transcript.text && transcript.text.length !== 0 && (
                                    <TranscriptComponent
                                        transcriptDatas={transcript}
                                        handleClose={handleClose}
                                        open={open}
                                        anchorEl={anchorEl}
                                    />
                                )}
                            </>
                        </div>
                    ) }
                </div>

                {/* {error && <div className='transcript-error'>{error}</div>} */}
            </div>
        </>
    );
}

export default VoiceMessageAttachmentPlayer;
