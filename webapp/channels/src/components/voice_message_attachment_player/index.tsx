// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    PlayIcon,
    PauseIcon,
    DotsVerticalIcon,
    CloseIcon,
    LinkVariantIcon,
    DownloadOutlineIcon,
} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {FileInfo} from '@mattermost/types/files';
import type {Post} from '@mattermost/types/posts';

import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import {
    AudioPlayerState,
    useAudioPlayer,
} from 'components/common/hooks/useAudioPlayer';
import * as Menu from 'components/menu';

import {convertSecondsToMSS} from 'utils/datetime';
import {getSiteURL} from 'utils/url';
import {copyToClipboard} from 'utils/utils';

interface Props {
    postId?: Post['id'];
    fileId: FileInfo['id'];
    inPost?: boolean;
    onCancel?: () => void;
}

function VoiceMessageAttachmentPlayer(props: Props) {
    const {formatMessage} = useIntl();

    const {playerState, duration, elapsed, togglePlayPause} = useAudioPlayer(props.fileId ? `/api/v4/files/${props.fileId}` : '');

    const progressValue = elapsed === 0 || duration === 0 ? '0' : (elapsed / duration).toFixed(2);

    function copyLink() {
        copyToClipboard(`${getSiteURL()}/api/v4/files/${props.fileId}`);
    }

    function downloadFile() {
        window.location.assign(getFileDownloadUrl(props.fileId));
    }

    return (
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
                            id={`permalink_${props.postId}`}
                            leadingElement={<LinkVariantIcon size={18}/>}
                            labels={(
                                <FormattedMessage
                                    id='single_image_view.copy_link_tooltip'
                                    defaultMessage='Copy link'
                                />
                            )}
                            onClick={copyLink}
                        />
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
    );
}

export default VoiceMessageAttachmentPlayer;
