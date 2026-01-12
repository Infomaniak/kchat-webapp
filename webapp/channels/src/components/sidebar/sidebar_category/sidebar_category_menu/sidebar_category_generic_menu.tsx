// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    DotsVerticalIcon,
} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React, {memo, useState} from 'react';
import {useIntl} from 'react-intl';

import * as Menu from 'components/menu';

type Props = {
    id: string;
    menuTriggerRef?: React.RefObject<HTMLButtonElement>;
    children: React.ReactNode[];
    name: string;
};

const SidebarCategoryGenericMenu = ({
    id,
    menuTriggerRef,
    children,
    name,
}: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const {formatMessage} = useIntl();

    function handleMenuToggle(isOpen: boolean) {
        setIsMenuOpen(isOpen);
    }

    return (
        <div
            className={classNames(
                'SidebarMenu',
                'MenuWrapper',
                {
                    'MenuWrapper--open': isMenuOpen,
                    menuOpen: isMenuOpen,
                },
            )}
        >
            <Menu.Container
                menuButton={{
                    id: `SidebarCategoryMenu-Button-${id}`,
                    'aria-label': formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'}, {name}),
                    class: 'SidebarMenu_menuButton',
                    children: <DotsVerticalIcon size={16}/>,
                    ref: menuTriggerRef,
                }}
                menuButtonTooltip={{
                    text: formatMessage({id: 'sidebar_left.sidebar_category_menu.editCategory', defaultMessage: 'Category options'}, {name}),
                    class: 'hidden-xs',
                }}
                menu={{
                    id: `SidebarChannelMenu-MenuList-${id}`,
                    'aria-label': formatMessage({id: 'sidebar_left.sidebar_category_menu.dropdownAriaLabel', defaultMessage: 'Edit category menu'}),
                    onToggle: handleMenuToggle,
                }}
            >
                {children}
            </Menu.Container>
        </div>
    );
};

export default memo(SidebarCategoryGenericMenu);
