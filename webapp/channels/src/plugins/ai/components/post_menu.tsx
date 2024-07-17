import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {Post} from '@mattermost/types/posts';

import styled from 'styled-components';

import IconAI from './assets/icon_ai';
import DotMenu, {DropdownMenu, DropdownMenuItem} from './dot_menu';
import IconThreadSummarization from './assets/icon_thread_summarization';
import {Divider, DropdownInfoOnlyVisibleToYou} from './dropdown_info';
import {Client4} from 'mattermost-redux/client';
import {GrayPill} from './pill';
import {useDispatch} from 'react-redux';
import {selectPostById} from 'actions/views/rhs';

// import IconReactForMe from './assets/icon_react_for_me';
// import {DropdownBotSelector} from './bot_slector';
// import {useSelector} from 'react-redux';
// import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';
// import {getPost} from 'mattermost-redux/actions/posts';

const BotPill = styled(GrayPill)`
	font-size: 12px;
	padding: 2px 6px;
	gap: 0;
`;

type Props = {
    post: Post,
}

const PostMenu = (props: Props) => {
    const dispatch = useDispatch();
    const intl = useIntl();

    // TODO: find a way to get this for the current team
    const bots = {
        "9c81435c-b533-43a1-92be-25fac468877a": {
            "id": "9c81435c-b533-43a1-92be-25fac468877a",
            "last_picture_update": 0,
            "username": "chat.gpt",
            "email": "chat.gpt@localhost",
            "nickname": "chat.gpt",
            "is_bot": true,
            "first_name": "Chat",
            "last_name": "GPT",
            "public_picture_url": "https:\/\/infomaniak.kchat.preprod.dev.infomaniak.ch\/static\/images\/chat_gpt.png"
        }
    }
    // const bots = useSelector(getBotAccounts);
    const botsArray = Object.values(bots);
    const post = props.post;

    const summarizePost = async (postId: string) => {
        const result = await Client4.doSummarize(postId, botsArray[0]?.username || '');
        console.log(result)
        dispatch(selectPostById(result.postid));
        Client4.viewMyChannel(result.channelid)
    };

    // Unconfigured state
    if (bots && botsArray.length === 0) {
        return null;
    }

    return (
        <DotMenu
            icon={<IconAI/>}
            title={intl.formatMessage({id: 'ai.actions', defaultMessage: 'AI Actions'})}
            dropdownMenu={StyledDropdownMenu}
        >
            {/* <DropdownBotSelector
                bots={botsArray ?? []}
                activeBot={botsArray[0]}
                setActiveBot={() => {}}
            /> */}
            <BotPill>
                {botsArray[0].nickname}
            </BotPill>
            <Divider/>
            <DropdownMenuItem onClick={() => summarizePost(post.id)}>
                <span className='icon'><IconThreadSummarization/></span>
                <FormattedMessage id="ai.summarizeThread" defaultMessage='Summarize Thread'/>
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => Client4.doReaction(post.id)}>
                <span className='icon'><IconReactForMe/></span>
                <FormattedMessage defaultMessage='React for me'/>
            </DropdownMenuItem> */}
            <Divider/>
            <DropdownInfoOnlyVisibleToYou/>
        </DotMenu>
    );
};

const StyledDropdownMenu = styled(DropdownMenu)`
	min-width: 240px;
`;

export default PostMenu;
