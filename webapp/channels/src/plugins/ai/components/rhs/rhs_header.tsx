
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useLocation, useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';

import {ChevronDownIcon} from '@mattermost/compass-icons/components';

import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';

import {switchToChannel} from 'actions/views/channel';
import {closeRightHandSide} from 'actions/views/rhs';

import type {GlobalState} from 'types/store';

import {Button} from './common';

import {BotDropdown} from '../bot_slector';
import {DotMenuButton} from '../dot_menu';

import type {LLMBot} from '@/bots';

type Props = {
    currentTab?: string;
    bots?: LLMBot[] | null;
    activeBot?: LLMBot | null;
    setCurrentTab?: (tab: string) => void;
    selectPost?: (postId: string) => void;
    setActiveBot?: (bot: LLMBot) => void;
    channelName: string;
    onChatHistoryClick?: () => void;
}

const RHSHeader = (props: Props) => {
    const dispatch = useDispatch();
    const kChatBotChannel = useSelector((state: GlobalState) => getChannelByName(state, props.channelName));

    let historyButton = null;
    if (props.currentTab === 'threads') {
        historyButton = (
            <ButtonDisabled>
                <i className='icon-clock-outline'/>
                <FormattedMessage
                    id='temp'
                    defaultMessage='Chat history'
                />
            </ButtonDisabled>
        );
    } else {
        historyButton = (
            <HistoryButton
                data-testid='chat-history'
                onClick={props.onChatHistoryClick}
            >
                <i className='icon-clock-outline'/>
                <FormattedMessage
                    id='temp'
                    defaultMessage='View chat history'
                />
            </HistoryButton>
        );
    }
    const currentBotName = props.activeBot?.displayName ?? '';
    return (
        <Header>
            {historyButton}
            {props.currentTab !== 'new' && kChatBotChannel && (
                <NewChatButton
                    data-testid='new-chat'
                    className='new-button'
                    onClick={() => {
                        dispatch(closeRightHandSide());
                        dispatch(switchToChannel(kChatBotChannel));
                    }}

                    // onClick={() => {
                    //     props.setCurrentTab('new');
                    //     props.selectPost('');
                    // }}
                >
                    <i className='icon icon-pencil-outline'/>
                    <FormattedMessage
                        id='temp'
                        defaultMessage='New chat'
                    />
                </NewChatButton>
            )}
            {(props.currentTab === 'new' && props.bots) && (
                <BotDropdown
                    bots={props.bots}
                    activeBot={props.activeBot}
                    setActiveBot={props.setActiveBot}
                    container={SelectorDropdown}
                >
                    <>
                        {currentBotName}
                        <ChevronDownIcon/>
                    </>
                </BotDropdown>
            )}
        </Header>
    );
};

const HistoryButton = styled(Button)`
	padding: 8px 12px;
    color: rgba(var(--center-channel-color-rgb), 0.64);
`;

const ButtonDisabled = styled(Button)`
	&:hover {
		background: transparent;
		color: rgb(var(--center-channel-color));
		cursor: unset;
	}
`;

const NewChatButton = styled(Button)`
	color: rgb(var(--link-color-rgb));
	&:hover {
		color: rgb(var(--link-color-rgb));
        background-color: rgba(var(--button-bg-rgb), 0.08);
	}

	&:active {
		background-color: rgba(var(--button-bg-rgb), 0.12);
	}
`;

const Header = styled.div`
    display: flex;
	padding 8px 12px;
	justify-content: space-between;
	align-items: center;
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.12);
    flex-wrap: wrap;
`;

const SelectorDropdown = styled(DotMenuButton)<{isActive: boolean}>`
	display: flex;
	align-items: center;
	padding: 2px 4px 2px 6px;
	border-radius: 4px;
	height: 20px;
	width: auto;
	max-width: 145px;
	overflow: ellipsis;

	font-size: 11px;
	font-weight: 600;
	line-height: 16px;

    color: ${(props) => (props.isActive ? 'var(--button-bg)' : 'var(--center-channel-color-rgb)')};
    background-color: ${(props) => (props.isActive ? 'rgba(var(--button-bg-rgb), 0.16)' : 'rgba(var(--center-channel-color-rgb), 0.08)')};

    &:hover {
        color: ${(props) => (props.isActive ? 'var(--button-bg)' : 'var(--center-channel-color-rgb)')};
        background-color: ${(props) => (props.isActive ? 'rgba(var(--button-bg-rgb), 0.16)' : 'rgba(var(--center-channel-color-rgb), 0.16)')};
    }
`;

export default React.memo(RHSHeader);
