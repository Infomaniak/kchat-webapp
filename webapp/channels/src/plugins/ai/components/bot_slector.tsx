import {CheckIcon, ChevronDownIcon} from '@infomaniak/compass-icons/components';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

import {Client4} from 'mattermost-redux/client';

import type {DotMenuButton} from './dot_menu';
import DotMenu, {DropdownMenu, DropdownMenuItem} from './dot_menu';
import {GrayPill} from './pill';

interface LLMBot {
    id: string;
    displayName: string;
    username: string;
    lastIconUpdate: number;
    dmChannelID: string;
}

type DropdownBotSelectorProps = {
    bots: LLMBot[];
    activeBot: LLMBot | null;
    setActiveBot: (bot: LLMBot) => void;
}

export const DropdownBotSelector = (props: DropdownBotSelectorProps) => {
    return (
        <BotDropdown
            bots={props.bots}
            activeBot={props.activeBot}
            setActiveBot={props.setActiveBot}
            container={BotSelectorContainer}
        >
            <>
                {/* <SelectMessage>
                    <FormattedMessage id='' defaultMessage='Generate With:'/>
                </SelectMessage> */}
                <BotPill>
                    {props.activeBot?.displayName}
                    <ChevronDownIcon/>
                </BotPill>
            </>
        </BotDropdown>
    );
};

const BotPill = styled(GrayPill)`
	font-size: 12px;
	padding: 2px 6px;
	gap: 0;
`;

const BotSelectorContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;

	margin: 8px 16px;
	color: rgba(var(--center-channel-color-rgb), 0.56);
`;

type BotDropdownProps = {
    bots: LLMBot[];
    activeBot: LLMBot | null;
    setActiveBot: (bot: LLMBot) => void;
    container: typeof DotMenuButton;
    children: JSX.Element;
}

export const BotDropdown = (props: BotDropdownProps) => {
    return (
        <DotMenu
            icon={props.children}
            title={props.activeBot?.displayName}
            dotMenuButton={props.container}
            dropdownMenu={StyledDropdownMenu}
        >
            {/* <MenuInfoMessage>
                <FormattedMessage defaultMessage='Choose a Bot'/>
            </MenuInfoMessage> */}
            {props.bots.map((bot) => {
                const botProfileURL = Client4.getProfilePictureUrl(bot.id, bot.lastIconUpdate);
                return (
                    <StyledDropdownMenuItem
                        key={bot.displayName}
                        onClick={() => props.setActiveBot(bot)}
                    >
                        <BotIconDropdownItem
                            src={botProfileURL}
                        />
                        {bot.displayName}
                        {props.activeBot && (props.activeBot.id === bot.id) && (
                            <StyledCheckIcon/>
                        )}
                    </StyledDropdownMenuItem>
                );
            })}
        </DotMenu>
    );
};

const StyledDropdownMenu = styled(DropdownMenu)`
	min-width: 270px;
`;

const StyledCheckIcon = styled(CheckIcon)`
	margin-left: auto;
	color: var(--button-bg);
`;

const StyledDropdownMenuItem = styled(DropdownMenuItem)`
	padding: 8px 16px;
`;

const MenuInfoMessage = styled.div`
	padding: 6px 20px;

	color: rgba(var(--center-channel-color-rgb), 0.56);
	font-size: 12px;
	font-weight: 600;
	line-height: 16px;
	letter-spacing: 0.48px;
	text-transform: uppercase;
`;

const BotIconDropdownItem = styled.img`
	border-radius: 50%;
    width: 24px;
    height: 24px;
	margin-right: 8px;
`;

const SelectMessage = styled.div`
	font-size: 12px;
	font-weight: 600;
	line-height: 16px;
	letter-spacing: 0.24px;
	text-transform: uppercase;
`;
