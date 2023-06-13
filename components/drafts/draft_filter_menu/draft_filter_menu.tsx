// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {MuiMenuStyled} from 'components/menu/menu_styled';
import {MenuItem} from 'components/menu/menu_item';
import CompassDesignProvider from 'components/compass_design_provider';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import './draft_filter_menu.scss';

export enum DraftFilter {
    ALL,
    SCHEDULED,
    NOT_SCHEDULED,
}

type Props = {
    filter: DraftFilter;
    setFilter: (filter: DraftFilter) => void;
}

type MenuItem = {
    key: string;
    label: {
        id: string;
        defaultMessage: string;
    };
    filter: DraftFilter;
};

const menuItems: MenuItem[] = [
    {key: 'all', label: {id: 'drafts.filter.menu.all', defaultMessage: 'All drafts'}, filter: DraftFilter.ALL},
    {key: 'scheduled', label: {id: 'drafts.filter.menu.scheduled', defaultMessage: 'Scheduled'}, filter: DraftFilter.SCHEDULED},
    {key: 'not_scheduled', label: {id: 'drafts.filter.menu.not_scheduled', defaultMessage: 'Not scheduled'}, filter: DraftFilter.NOT_SCHEDULED},
];

const DraftFilterMenu = ({filter, setFilter}: Props) => {
    const theme = useSelector(getTheme);
    const {formatMessage} = useIntl();
    const [open, setOpen] = useState<boolean>(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const handleClose = () => setOpen(false);

    const handleItemClick = (newFilter: DraftFilter) => {
        setOpen(false);
        setFilter(newFilter);
    };

    const renderedItems = menuItems.map((item) => (
        <MenuItem
            key={'draft-filter-menu-' + item.key}
            className='draft-filter-menu__item'
            labels={<FormattedMessage {...item.label}/>}
            onClick={() => handleItemClick(item.filter)}
            trailingElements={filter === item.filter ? <i className='icon icon-check'/> : null}
        />
    ));

    return (
        <CompassDesignProvider theme={theme}>
            <OverlayTrigger
                className='hidden-xs'
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={
                    <Tooltip
                        id='drafts_filter_menu_tooltip'
                        className='hidden-xs'
                    >
                        {formatMessage({
                            id: 'drafts.filter.menu_button_tooltip',
                            defaultMessage: 'Filter drafts',
                        })}
                    </Tooltip>
                }
            >
                <button
                    ref={menuButtonRef}
                    className='icon draft-filter-menu__button'
                    aria-label={formatMessage({id: 'drafts.filter.menu_button_aria', defaultMessage: 'Open draft filter menu'})}
                    onClick={() => setOpen(true)}
                >
                    <i className='icon icon-filter-variant'/>
                </button>
            </OverlayTrigger>
            <MuiMenuStyled
                className='draft-filter-menu'
                open={open}
                anchorEl={menuButtonRef.current}
                onClose={handleClose}
            >
                <h5 className='draft-filter-menu__title'>
                    {formatMessage({
                        id: 'drafts.filter.menu.title',
                        defaultMessage: 'Show',
                    })}
                </h5>
                {renderedItems}
            </MuiMenuStyled>
        </CompassDesignProvider>
    );
};

export default DraftFilterMenu;
