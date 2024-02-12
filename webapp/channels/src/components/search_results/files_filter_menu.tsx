// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FilterVariantIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {IconContainer} from '../advanced_text_editor/formatting_bar/formatting_icon';
import type {SearchFilterType} from '../search/types';

import './files_filter_menu.scss';

type Props = {
    selectedFilter: string;
    onFilter: (filter: SearchFilterType) => void;
};

export default function FilesFilterMenu(props: Props): JSX.Element {
    const {formatMessage} = useIntl();
    const toolTip = (
        <Tooltip
            id='files-filter-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='channel_info_rhs.menu.files.filter'
                defaultMessage='Filter'
            />
        </Tooltip>
    );
    return (
        <div className='FilesFilterMenu'>
            <MenuWrapper>
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={toolTip}
                    rootClose={true}
                >
                    <IconContainer
                        id='filesFilterButton'
                        className='action-icon dots-icon'
                        type='button'
                    >
                        {props.selectedFilter !== 'all' && <i className='icon-dot'/>}
                        <FilterVariantIcon
                            size={18}
                            color='currentColor'
                        />
                    </IconContainer>
                </OverlayTrigger>
                <Menu
                    ariaLabel={'file menu'}
                    openLeft={true}
                >
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.label', defaultMessage: 'All file types'})}
                        text={formatMessage({id: 'fileTypes.label', defaultMessage: 'All file types'})}
                        onClick={() => props.onFilter('all')}
                        icon={props.selectedFilter === 'all' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Documents', defaultMessage: 'Documents'})}
                        text={formatMessage({id: 'fileTypes.Documents', defaultMessage: 'Documents'})}
                        onClick={() => props.onFilter('documents')}
                        icon={props.selectedFilter === 'documents' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Spreadsheets', defaultMessage: 'Spreadsheets'})}
                        text={formatMessage({id: 'fileTypes.Spreadsheets', defaultMessage: 'Spreadsheets'})}
                        onClick={() => props.onFilter('spreadsheets')}
                        icon={props.selectedFilter === 'spreadsheets' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Presentations', defaultMessage: 'Presentations'})}
                        text={formatMessage({id: 'fileTypes.Presentations', defaultMessage: 'Presentations'})}
                        onClick={() => props.onFilter('presentations')}
                        icon={props.selectedFilter === 'presentations' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Code', defaultMessage: 'Code'})}
                        text={formatMessage({id: 'fileTypes.Code', defaultMessage: 'Code'})}
                        onClick={() => props.onFilter('code')}
                        icon={props.selectedFilter === 'code' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Images', defaultMessage: 'Images'})}
                        text={formatMessage({id: 'fileTypes.Images', defaultMessage: 'Images'})}
                        onClick={() => props.onFilter('images')}
                        icon={props.selectedFilter === 'images' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Audio', defaultMessage: 'Audio'})}
                        text={formatMessage({id: 'fileTypes.Audio', defaultMessage: 'Audio'})}
                        onClick={() => props.onFilter('audio')}
                        icon={props.selectedFilter === 'audio' ? <i className='icon icon-check'/> : null}
                    />
                    <Menu.ItemAction
                        ariaLabel={formatMessage({id: 'fileTypes.Videos', defaultMessage: 'Videos'})}
                        text={formatMessage({id: 'fileTypes.Videos', defaultMessage: 'Videos'})}
                        onClick={() => props.onFilter('video')}
                        icon={props.selectedFilter === 'video' ? <i className='icon icon-check'/> : null}
                    />
                </Menu>
            </MenuWrapper>
        </div>
    );
}
