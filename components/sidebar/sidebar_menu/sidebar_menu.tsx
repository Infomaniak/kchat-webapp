// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {DraggingState} from 'types/store';
import {DraggingStates} from 'utils/constants';

const MENU_BOTTOM_MARGIN = 80;

type Props = {
    id: string;
    children?: React.ReactNode;
    tooltipText: string;
    buttonAriaLabel: string;
    ariaLabel: string;
    isMenuOpen: boolean;
    onOpenDirectionChange: (openUp: boolean) => void;
    onToggleMenu: (open: boolean) => void;
    draggingState: DraggingState;
    tabIndex?: number;
    additionalClass?: string;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
};

type State = {
    openUp: boolean;
};

export default class SidebarMenu extends React.PureComponent<Props, State> {
    menuWrapperRef: React.RefObject<MenuWrapper>;
    menuRef?: Menu;
    // menuButtonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
        };

        this.menuWrapperRef = React.createRef();
        // this.menuButtonRef = React.createRef();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.draggingState.state !== this.props.draggingState.state && this.props.draggingState.state === DraggingStates.CAPTURE) {
            this.closeMenu();
        }

        if (this.props.isMenuOpen && !prevProps.isMenuOpen) {
            this.setMenuPosition();
            this.disableScrollbar();
        }
    }

    closeMenu = () => {
        if (this.menuWrapperRef.current) {
            this.menuWrapperRef.current.close();
        }

        this.props.onToggleMenu(false);
    }

    // Set the z-index on the sidebar scrollbar while a menu is open so that it doesn't float on top of menus
    disableScrollbar = () => {
        const scrollbars: NodeListOf<HTMLElement> = document.querySelectorAll('#SidebarContainer .SidebarNavContainer .scrollbar--view');
        if (scrollbars && scrollbars[0]) {
            scrollbars[0].style.zIndex = this.props.isMenuOpen ? '3' : 'unset';
        }
    }

    refCallback = (ref: Menu) => {
        this.menuRef = ref;
    }

    setMenuPosition = () => {
        if (!this.props.menuButtonRef.current) {
            return;
        }

        const buttonRect = this.props.menuButtonRef.current?.getBoundingClientRect();
        const y = typeof buttonRect?.y === 'undefined' ? buttonRect?.top : buttonRect.y;
        const windowHeight = window.innerHeight;

        const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
        const spaceOnTop = y || 0;
        const spaceOnBottom = totalSpace - spaceOnTop;

        const openUp = spaceOnTop > spaceOnBottom;

        if (this.state.openUp !== openUp) {
            this.setState({
                openUp,
            });

            this.props.onOpenDirectionChange(openUp);
        }

        if (this.menuRef) {
            const menuRef = this.menuRef.node.current?.parentElement as HTMLDivElement;
            const openUpOffset = openUp ? -this.props.menuButtonRef.current.getBoundingClientRect().height : 0;
            menuRef.style.top = `${window.scrollY + this.props.menuButtonRef.current.getBoundingClientRect().top + this.props.menuButtonRef.current.clientHeight + openUpOffset}px`;
        }
    }

    render() {
        const {
            ariaLabel,
            buttonAriaLabel,
            children,
            isMenuOpen,
            tooltipText,
            id,
            additionalClass,
        } = this.props;

        const tooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                {tooltipText}
            </Tooltip>
        );

        return (
            <MenuWrapper
                ref={this.menuWrapperRef}
                className={classNames('SidebarMenu', {
                    menuOpen: isMenuOpen,
                })}
                onToggle={this.props.onToggleMenu}
                stopPropagationOnToggle={true}
            >
                <OverlayTrigger
                    delayShow={500}
                    placement='top'
                    overlay={tooltip}
                    disabled={isMenuOpen}
                >
                    <button
                        ref={this.props.menuButtonRef}
                        className={classNames(['SidebarMenu_menuButton', {additionalClass}])}
                        aria-label={buttonAriaLabel}
                        tabIndex={this.props.tabIndex}
                    >
                        <i className='icon-dots-vertical'/>
                    </button>
                </OverlayTrigger>
                <Menu
                    ref={this.refCallback}
                    openUp={this.state.openUp}
                    id={`SidebarMenu-${id}`}
                    ariaLabel={ariaLabel}
                >
                    {children}
                </Menu>
            </MenuWrapper>
        );
    }
}
