// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    CloseIcon,
    DownloadOutlineIcon,
} from '@infomaniak/compass-icons/components';
import React, {useState} from 'react';
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
import LoadingSpinner from 'components/widgets/loading/loading_spinner';

import Constants from 'utils/constants';
import {convertSecondsToMSS} from 'utils/datetime';

export interface Props {
    postId?: Post['id'];
    fileId: FileInfo['id'];
    inPost?: boolean;
    onCancel?: () => void;
    isPreview?: boolean;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {formatMessage} = useIntl();
    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(props.fileId ? `/api/v4/files/${props.fileId}` : '');

    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);
    const [transcript, setTranscript] = useState('');
    const [transcriptDatas, setTranscriptDatas] = useState<TranscriptData>();
    const [hasFetchedTranscript, setHasFetchedTranscript] = useState(false);
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
    const [error, setError] = useState<JSX.Element | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLAnchorElement | null>(null);
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchTranscript = async () => {
        if (!hasFetchedTranscript) {
            setIsLoadingTranscript(true);
            const result = await fetchTranscriptData(props.fileId);
            if (!result.text) {
                setError(
                    <FormattedMessage
                        id='vocals.transcript.error'
                        defaultMessage='The audio is empty.'
                    />,
                );
            }
            setIsLoadingTranscript(false);
            if (result.text) {
                setTranscript(result.text.trim());
            }
            setTranscriptDatas(result);
            setHasFetchedTranscript(true);
        }
    };

    const transcriptIcon = () => Constants.TRANSCRIPT_ICON;

    function downloadFile() {
        window.location.assign(getFileDownloadUrl(props.fileId));
    }
    const toggleTranscriptModal = () => {
        setIsTranscriptModalOpen(!isTranscriptModalOpen);
    };

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
                    {props.inPost && (
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
                                id={`download_${props.postId}`}
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
                    {!props.isPreview && (
                        <div
                            onClick={() => {
                                fetchTranscript();
                                toggleTranscriptModal();
                            }}
                            className='post-image__end-button'
                        >
                            {isLoadingTranscript ? (
                                <LoadingSpinner/>
                            ) : (
                                <div >
                                    <img src={transcriptIcon()}/>
                                </div>
                            )}
                        </div>)}
                    {!props.inPost && (
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
            <div >
                <div>
                    {transcript && transcriptDatas && isTranscriptModalOpen && (
                        <div>
                            {transcript.length > 300 ? transcript.substring(0, 300) + '... ' : transcript + ' '}
                            <a
                                className='transcript-link-view'
                                onClick={(event) => {
                                    handleClick(event);
                                }}
                            >
                                <FormattedMessage
                                    id={'vocals.loading_transcript'}
                                    defaultMessage={'View transcript'}
                                />
                            </a>
                        </div>
                    )}
                    {transcriptDatas &&
                        <TranscriptComponent
                            transcriptDatas={transcriptDatas}
                            handleClose={handleClose}
                            open={open}
                            anchorEl={anchorEl}
                        />
                    }
                </div>
                {error && <div className='transcript-error'>{error}</div>}
            </div>
        </>
    );
}

export default VoiceMessageAttachmentPlayer;
