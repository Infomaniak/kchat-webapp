import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import MoreDirectChannels from 'components/more_direct_channels';
import QuickSwitchModal from 'components/quick_switch_modal';

import {ModalIdentifiers} from 'utils/constants';
import type EmojiMap from 'utils/emoji_map';
import {isDesktopApp} from 'utils/user_agent';

import type {ModalData} from 'types/actions';

type Props = {
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
    };
    emojiMap: EmojiMap;
};

type Action = {
    type: 'send_message' | 'browse_channels' | 'download_app';
    defaultMessage: string;
    visible: boolean;
}

const actions: Action[] = [
    {
        type: 'send_message',
        defaultMessage: '<emoji>writing_hand</emoji> Write to someone',
        visible: true,
    },
    {
        type: 'browse_channels',
        defaultMessage: '<emoji>mag</emoji> Browse channels',
        visible: true,
    },
    {
        type: 'download_app',
        defaultMessage: '<span><emoji>computer</emoji><emoji>iphone</emoji></span> Download the apps',
        visible: !isDesktopApp(),
    },
];

const IkWelcomeButtons = (props: Props) => {
    const handleClick = (type: Action['type']) => {
        switch (type) {
        case 'send_message':
            props.actions.openModal({
                modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
                dialogType: MoreDirectChannels,
                dialogProps: {isExistingChannel: false},
            });
            break;
        case 'browse_channels':
            props.actions.openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
            break;
        case 'download_app':
            window.open('https://infomaniak.com/gtl/apps.kchat', '_blank', 'noopener,noreferrer');
            break;
        }
    };

    const renderIcon = (icon: string) => {
        const emoji = props.emojiMap.get(icon);
        const backgroundImage = emoji ? `url(${getEmojiImageUrl(emoji)})` : '';
        return (
            <span
                className={`emoticon emoticon--${icon}`}
                style={{backgroundImage}}
            />
        );
    };

    const formatter = {
        b: (chunks: React.ReactNode) => (<b>{chunks}</b>),
        span: (chunks: React.ReactNode) => (<span>{chunks}</span>),
        emoji: (chunks: React.ReactNode) => (Array.isArray(chunks) && typeof chunks[0] === 'string' ? renderIcon(chunks[0]) : ''),

    };

    return (
        <div className='system-bot-message'>
            <p>
                <FormattedMessage
                    id='post.systemBot.welcome.line1'
                    defaultMessage={'Hello! Happy to see you here and welcome <emoji>blush</emoji>'}
                    values={formatter}
                />
                <br/>
                <FormattedMessage
                    id='post.systemBot.welcome.line2'
                    defaultMessage={'I\'m here to answer your questions and send you reminders and notifications about your kSuite products when needed.'}
                    values={formatter}
                />
            </p>

            <p className='mt-2'>
                <FormattedMessage
                    id='post.systemBot.welcome.line3'
                    defaultMessage={'<b>To get started</b>, here are some quick actions to explore kChat'}
                    values={formatter}
                />
            </p>

            <div className='system-bot-message__buttons'>
                {actions.map((action) => (action.visible ? (
                    <button
                        key={`welcome-button-${action.type}`}
                        className='btn btn-sm btn-outline'
                        type='button'
                        onClick={() => {
                            handleClick(action.type);
                        }}
                    >
                        <FormattedMessage
                            id={`post.systemBot.welcome.action.${action.type}`}
                            defaultMessage={action.defaultMessage}
                            values={formatter}
                        />
                    </button>
                ) : null),
                )}
            </div>

            <p className='mt-1 mb-2'>
                <FormattedMessage
                    id='post.systemBot.welcome.line4'
                    defaultMessage={'<emoji>arrow_down</emoji> Or <b>ask me a question</b> directly here!'}
                    values={formatter}
                />
            </p>
        </div>
    );
};

export default React.memo(IkWelcomeButtons);
