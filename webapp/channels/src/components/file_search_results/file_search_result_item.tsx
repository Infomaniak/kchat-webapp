// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {defineMessage, FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import FileThumbnail from 'components/file_attachment/file_thumbnail';
import FilePreviewModal from 'components/file_preview_modal';
import * as Menu from 'components/menu';
import Timestamp, {RelativeRanges} from 'components/timestamp';
import Tag from 'components/widgets/tag/tag';
import WithTooltip from 'components/with_tooltip';

import {getHistory} from 'utils/browser_history';
import Constants, {ModalIdentifiers} from 'utils/constants';
import {getSiteURL} from 'utils/url';
import {isDesktopApp} from 'utils/user_agent';
import {fileSizeToString, copyToClipboard} from 'utils/utils';

import type {PropsFromRedux, OwnProps} from './index';

import './file_search_result_item.scss';

type Props = OwnProps & PropsFromRedux;

type State = {
    keepOpen: boolean;
}

const FILE_TOOLTIP_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

export default class FileSearchResultItem extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {keepOpen: false};
    }

    private jumpToConv = (e: React.MouseEvent | React.KeyboardEvent) => {
        if ('stopPropagation' in e) {
            e.stopPropagation();
        }
        getHistory().push(`/${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    };

    private copyLink = () => {
        copyToClipboard(`${getSiteURL()}/${this.props.teamName}/pl/${this.props.fileInfo.post_id}`);
    };

    private stopPropagation = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
    };

    private keepOpen = (open: boolean) => {
        this.setState({keepOpen: open});
    };

    private renderPluginItems = () => {
        const {fileInfo} = this.props;
        const pluginItems = this.props.pluginMenuItems?.filter((item) => item?.match(fileInfo)).map((item) => {
            return (
                <Menu.Item
                    key={item.id + '_pluginmenuitem'}
                    onClick={() => item.action?.(fileInfo)}
                    labels={<span>{item.text}</span>}
                />
            );
        });

        if (!pluginItems?.length) {
            return null;
        }

        return (
            <>
                <Menu.Separator/>
                {pluginItems}
            </>
        );
    };

    private showPreview = () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.FILE_PREVIEW_MODAL,
            dialogType: FilePreviewModal,
            dialogProps: {
                fileInfos: [this.props.fileInfo],
                postId: this.props.fileInfo.post_id,
                startIndex: 0,
            },
        });
    };

    public render(): React.ReactNode {
        const {fileInfo, channelDisplayName, channelType} = this.props;
        let channelName: React.ReactNode = channelDisplayName;
        if (channelType === Constants.DM_CHANNEL) {
            channelName = (
                <FormattedMessage
                    id='search_item.file_tag.direct_message'
                    defaultMessage='Direct Message'
                />
            );
        } else if (channelType === Constants.GM_CHANNEL) {
            channelName = (
                <FormattedMessage
                    id='search_item.file_tag.group_message'
                    defaultMessage='Group Message'
                />
            );
        }

        const fileDownloadUrl = isDesktopApp() ? `/api/v4/files/${fileInfo.id}?download=1&access_token=${Client4.getToken()}` : `/api/v4/files/${fileInfo.id}?download=1`;

        return (
            <div
                data-testid='search-item-container'
                className='search-item__container'
            >
                <button
                    className={classNames('FileSearchResultItem', {'keep-open': this.state.keepOpen})}
                    onClick={this.showPreview}
                >
                    <FileThumbnail fileInfo={fileInfo}/>
                    <div className='fileData'>
                        <div className='fileDataName'>{fileInfo.name}</div>
                        <div className='fileMetadata'>
                            {channelName && (
                                <Tag
                                    className='file-search-channel-name'
                                    text={channelName}
                                />
                            )}
                            <span>{fileSizeToString(fileInfo.size)}</span>
                            <span>{' • '}</span>
                            <Timestamp
                                value={fileInfo.create_at}
                                ranges={FILE_TOOLTIP_RANGES}
                            />
                        </div>
                    </div>
                    {this.props.fileInfo.post_id && (
                        <Menu.Container
                            menuButton={{
                                id: `file_action_button_${fileInfo.id}`,
                                class: classNames('action-icon', 'dots-icon', {
                                    'a11y--active': this.state.keepOpen,
                                }),
                                children: <i className='icon icon-dots-vertical'/>,
                            }}
                            menuButtonTooltip={{
                                text: 'More Actions',
                            }}
                            menu={{
                                id: `file_dropdown_${fileInfo.id}`,
                                'aria-label': 'file menu',
                                onToggle: this.keepOpen,
                            }}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <Menu.Item
                                onClick={this.jumpToConv}
                                labels={
                                    <FormattedMessage
                                        id='file_search_result_item.open_in_channel'
                                        defaultMessage='Open in channel'
                                    />
                                }
                            />
                            <Menu.Item
                                onClick={this.copyLink}
                                labels={
                                    <FormattedMessage
                                        id='file_search_result_item.copy_link'
                                        defaultMessage='Copy link'
                                    />
                                }
                            />
                            {this.renderPluginItems()}
                        </Menu.Container>
                    )}
                    <WithTooltip
                        title={defineMessage({id: 'file_search_result_item.download', defaultMessage: 'Download'})}
                    >
                        <a
                            className='action-icon download-icon'
                            href={fileDownloadUrl}
                            onClick={this.stopPropagation}
                        >
                            <i className='icon icon-download-outline'/>
                        </a>
                    </WithTooltip>
                </button>
            </div>
        );
    }
}
