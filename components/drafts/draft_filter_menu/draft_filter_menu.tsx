// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import * as Menu from 'components/menu';

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
    const {formatMessage} = useIntl();

    const renderedItems = menuItems.map((item) => (
        <Menu.Item
            key={'draft-filter-menu-' + item.key}
            className='draft-filter-menu__item'
            labels={<FormattedMessage {...item.label}/>}
            onClick={() => setFilter(item.filter)}
            trailingElements={filter === item.filter ? <i className='icon icon-check'/> : null}
        />
    ));

    return (
        <Menu.Container
            menu={{id: 'draft_filter_menu'}}
            menuButton={{
                id: 'draft_filter_menu_button',
                children: <i className='icon icon-filter-variant'/>,
                'aria-label': formatMessage({id: 'drafts.filter.menu_button_aria', defaultMessage: 'Open draft filter menu'}),
                class: 'icon draft-filter-menu__button',
            }}
            menuButtonTooltip={{
                id: 'drafts_filter_menu_tooltip',
                text: formatMessage({id: 'drafts.filter.menu_button_tooltip', defaultMessage: 'Filter drafts'}),
            }}
        >
            <h5 className='draft-filter-menu__title'>
                {formatMessage({
                    id: 'drafts.filter.menu.title',
                    defaultMessage: 'Show',
                })}
            </h5>
            {renderedItems}
        </Menu.Container>
    );
};

export default DraftFilterMenu;
