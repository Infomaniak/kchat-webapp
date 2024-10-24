// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    CloseIcon,
    DownloadOutlineIcon,
} from '@infomaniak/compass-icons/components';
import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {FileInfo} from '@mattermost/types/files';
import type {Post} from '@mattermost/types/posts';
import type {TranscriptData} from '@mattermost/types/transcript';

import {fetchTranscriptData} from 'mattermost-redux/actions/channels';
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
    post: Post;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {post} = props;

    // There is always one file id for type voice.
    const fileId = post.file_ids![0];

    // console.log(post);
    const transcript = post.metadata.files[0].transcript;
    console.log(transcript);
    const {formatMessage} = useIntl();
    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(fileId ? `/api/v4/files/${fileId}` : '');

    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);
    const [anchorEl, setAnchorEl] = React.useState<HTMLAnchorElement | null>(null);

    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(true);

    const open = Boolean(anchorEl);

    // useEffect(() => {
    //     if (!props.isPreview) {
    //         fetchTranscript();
    //     }
    // }, []);

    // const fetchTranscript = async () => {
    //     if (!hasFetchedTranscript) {
    //         setIsLoadingTranscript(true);
    //         const result = await fetchTranscriptData(props.fileId);
    //         if (!result.text) {
    //             setError(
    //                 <FormattedMessage
    //                     id='vocals.transcript.error'
    //                     defaultMessage='The audio is empty.'
    //                 />,
    //             );
    //         }
    //         setIsLoadingTranscript(false);
    //         if (result.text) {
    //             setTranscript(result.text.trim());
    //         }
    //         if (!Array.isArray(result)) {
    //             setTranscriptDatas(result);
    //         }
    //         setHasFetchedTranscript(true);
    //     }
    // };

    function downloadFile() {
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
            {transcript.length && transcript.length === 0 ? (
                <div style={{paddingRight: '3px'}}>
                    <TranscriptSpinner/>
                </div>
            ) : (
                <span className={`icon ${(isTranscriptModalOpen) ? 'icon-menu-down' : 'icon-menu-right'}`}/>
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
                            {transcript.length && transcript.length === 0 ? (
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
                                id={`download_${post.id}`}
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
                    {/* {!props.inPost && (
                        <button
                            className='post-image__end-button'
                            onClick={props.onCancel}
                        >
                            <CloseIcon
                                size={18}
                                color='currentColor'
                            />
                        </button>
                    )} */}
                </div>
            </div>
            <div>
                {props.isPreview ? null : (
                    <div>
                        <div className='file-view--single'>
                            <div className='file__image'>
                                {transcriptHeader}
                            </div>
                        </div>
                        <div >
                            <>
                                {typeof transcript === 'object' && transcript.length !== 0 && isTranscriptModalOpen && (
                                    <div style={{paddingTop: '5px'}}>
                                        {transcript.text.length > 300 ? transcript.text.substring(0, 300) + '... ' : transcript.text + ' '}
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
                                {typeof transcript === 'object' && transcript.length !== 0 && (
                                    <TranscriptComponent
                                        transcriptDatas={transcript}
                                        handleClose={handleClose}
                                        open={open}
                                        anchorEl={anchorEl}
                                    />
                                )}
                            </>
                        </div>
                    </div>)
                }
                {/* {error && <div className='transcript-error'>{error}</div>} */}
            </div>
        </>
    );
}

export default VoiceMessageAttachmentPlayer;
