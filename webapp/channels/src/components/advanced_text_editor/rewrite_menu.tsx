// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    ArrowCollapseIcon,
    ArrowExpandIcon,
    CloseIcon,
    FormatLetterCaseIcon,
    FormatListBulletedIcon,
    LightbulbOutlineIcon,
    PencilOutlineIcon,
    RefreshIcon,
    SquareIcon,
} from '@infomaniak/compass-icons/components';
import classNames from 'classnames';
import React, {useCallback, useRef, useState} from 'react';
import type {MessageDescriptor} from 'react-intl';
import {defineMessage, FormattedMessage, useIntl} from 'react-intl';

import * as Menu from 'components/menu';
import WithTooltip from 'components/with_tooltip';

import IconEuria from 'plugins/ai/components/assets/icon_euria';

import {IconContainer} from './formatting_bar/formatting_icon';
import {RewriteAction} from './rewrite_action';

interface MenuItemConfig {
    action: RewriteAction;
    label: MessageDescriptor;
    icon: React.ReactElement;
}

const menuItems: MenuItemConfig[] = [
    {
        action: RewriteAction.IMPROVE_WRITING,
        label: defineMessage({id: 'texteditor.rewrite.improveWriting', defaultMessage: 'Improve writing'}),
        icon: <PencilOutlineIcon size={18}/>,
    },
    {
        action: RewriteAction.FIX_SPELLING,
        label: defineMessage({id: 'texteditor.rewrite.fixSpelling', defaultMessage: 'Fix spelling and grammar'}),
        icon: <FormatLetterCaseIcon size={18}/>,
    },
    {
        action: RewriteAction.SHORTEN,
        label: defineMessage({id: 'texteditor.rewrite.shorten', defaultMessage: 'Shorten'}),
        icon: <ArrowCollapseIcon size={18}/>,
    },
    {
        action: RewriteAction.ELABORATE,
        label: defineMessage({id: 'texteditor.rewrite.elaborate', defaultMessage: 'Elaborate'}),
        icon: <ArrowExpandIcon size={18}/>,
    },
    {
        action: RewriteAction.SIMPLIFY,
        label: defineMessage({id: 'texteditor.rewrite.simplify', defaultMessage: 'Simplify'}),
        icon: <LightbulbOutlineIcon size={18}/>,
    },
    {
        action: RewriteAction.SUMMARIZE,
        label: defineMessage({id: 'texteditor.rewrite.summarize', defaultMessage: 'Summarize'}),
        icon: <FormatListBulletedIcon size={18}/>,
    },
];

const customPromptPlaceholder = defineMessage({id: 'texteditor.rewrite.prompt', defaultMessage: 'Ask Euria to edit message...'});
const customPromptNextPlaceholder = defineMessage({id: 'texteditor.rewrite.nextPrompt', defaultMessage: 'What would you like Euria to do next?'});

interface RewriteMenuProps {
    disabled?: boolean;
    isProcessing: boolean;
    hasOriginalMessage: boolean;
    onSelectAction: (action: RewriteAction, customPrompt?: string) => void;
    onUndo: () => void;
    onRegenerate: () => void;
    onStopGenerating: () => void;
}

const SparklesIcon = ({size = 18, color = 'currentColor'}: {size?: number; color?: string}) => (
    <svg
        width={size}
        height={size}
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M8 1L7.12 4.12L4 5L7.12 5.88L8 9L8.88 5.88L12 5L8.88 4.12L8 1Z'
            fill={color}
        />
        <path
            d='M12 7L11.648 8.248L10.4 8.6L11.648 8.952L12 10.2L12.352 8.952L13.6 8.6L12.352 8.248L12 7Z'
            fill={color}
        />
        <path
            d='M4 9L3.472 10.528L2 11L3.472 11.472L4 13L4.528 11.472L6 11L4.528 10.528L4 9Z'
            fill={color}
        />
    </svg>
);

const RewriteMenu = ({
    disabled,
    isProcessing,
    hasOriginalMessage,
    onSelectAction,
    onUndo,
    onRegenerate,
    onStopGenerating,
}: RewriteMenuProps) => {
    const {formatMessage} = useIntl();
    const [customPrompt, setCustomPrompt] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCustomPromptKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter' && customPrompt.trim()) {
            onSelectAction(RewriteAction.CUSTOM, customPrompt.trim());
            setCustomPrompt('');
        }
    }, [customPrompt, onSelectAction]);

    const handleCustomPromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomPrompt(e.target.value);
    }, []);

    if (isProcessing) {
        return (
            <WithTooltip
                title={formatMessage({
                    id: 'texteditor.rewrite.stopGenerating',
                    defaultMessage: 'Stop generating',
                })}
            >
                <IconContainer
                    id='rewriteStopButton'
                    type='button'
                    onClick={onStopGenerating}
                    aria-label={formatMessage({
                        id: 'texteditor.rewrite.stopGenerating',
                        defaultMessage: 'Stop generating',
                    })}
                    className='rewrite-stop-button'
                >
                    <SquareIcon
                        color='currentColor'
                        size={18}
                    />
                </IconContainer>
            </WithTooltip>
        );
    }

    const generatedByHeader = (
        <div className='rewrite-menu__generated-by'>
            <SparklesIcon
                size={14}
                color='currentColor'
            />
            <FormattedMessage
                id='texteditor.rewrite.generatedBy'
                defaultMessage='Generated by Euria'
            />
        </div>
    );

    const actionButtons = hasOriginalMessage ? (
        <div className='rewrite-menu__header'>
            <button
                type='button'
                className='rewrite-menu__action-button'
                onClick={onUndo}
                aria-label={formatMessage({
                    id: 'texteditor.rewrite.discard',
                    defaultMessage: 'Discard',
                })}
            >
                <CloseIcon
                    color='currentColor'
                    size={14}
                />
                <FormattedMessage
                    id='texteditor.rewrite.discard'
                    defaultMessage='Discard'
                />
            </button>
            <button
                type='button'
                className='rewrite-menu__action-button'
                onClick={onRegenerate}
                aria-label={formatMessage({
                    id: 'texteditor.rewrite.regenerate',
                    defaultMessage: 'Regenerate',
                })}
            >
                <RefreshIcon
                    color='currentColor'
                    size={14}
                />
                <FormattedMessage
                    id='texteditor.rewrite.regenerate'
                    defaultMessage='Regenerate'
                />
            </button>
        </div>
    ) : null;

    const menuHeader = (
        <>
            {generatedByHeader}
            {actionButtons}
        </>
    );

    const customPromptInput = (
        <div className='rewrite-menu__custom-prompt'>
            <input
                ref={inputRef}
                type='text'
                className='rewrite-menu__custom-input'
                placeholder={formatMessage(hasOriginalMessage ? customPromptNextPlaceholder : customPromptPlaceholder)}
                value={customPrompt}
                onChange={handleCustomPromptChange}
                onKeyDown={handleCustomPromptKeyDown}
            />
        </div>
    );

    return (
        <Menu.Container
            menuButton={{
                id: 'rewriteMenuButton',
                'aria-label': formatMessage({
                    id: 'texteditor.rewrite',
                    defaultMessage: 'Rewrite',
                }),
                class: classNames('rewrite-menu-button', {active: false}),
                disabled,
                children: (
                    <IconEuria/>
                ),
            }}
            menuButtonTooltip={{
                text: formatMessage({
                    id: 'texteditor.rewrite',
                    defaultMessage: 'Rewrite',
                }),
            }}
            menuHeader={menuHeader}
            menuFooter={customPromptInput}
            menu={{
                id: 'rewriteMenu',
                'aria-label': formatMessage({
                    id: 'texteditor.rewrite',
                    defaultMessage: 'Rewrite',
                }),
                className: 'rewrite-menu',
            }}
            closeMenuOnTab={false}
            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
            transformOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
            {menuItems.map((item) => (
                <Menu.Item
                    key={item.action}
                    onClick={() => onSelectAction(item.action)}
                    labels={<span>{formatMessage(item.label)}</span>}
                    leadingElement={item.icon}
                />
            ))}
        </Menu.Container>
    );
};

export default RewriteMenu;
