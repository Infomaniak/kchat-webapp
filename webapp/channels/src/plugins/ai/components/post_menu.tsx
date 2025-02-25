import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import type {Post} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {selectPostById} from 'actions/views/rhs';
import {handleEvent} from 'actions/websocket_actions';

import type {GlobalState} from 'types/store';

import IconAI from './assets/icon_ai';
import IconThreadSummarization from './assets/icon_thread_summarization';
import {DropdownBotSelector} from './bot_slector';
import DotMenu, {DropdownMenu, DropdownMenuItem} from './dot_menu';
import {Divider, DropdownInfoOnlyVisibleToYou} from './dropdown_info';
import {GrayPill} from './pill';

// import IconReactForMe from './assets/icon_react_for_me';
// import {DropdownBotSelector} from './bot_slector';
// import {useSelector} from 'react-redux';
// import {getBotAccounts} from 'mattermost-redux/selectors/entities/bots';
// import {getPost} from 'mattermost-redux/actions/posts';

// const BotPill = styled(GrayPill)`
// 	font-size: 12px;
// 	padding: 2px 6px;
// 	gap: 0;
// `;

type Props = {
    post: Post;
    location: string;
}

const PostMenu = (props: Props) => {
    const dispatch = useDispatch();
    const intl = useIntl();

    const post = props.post;

    const user = useSelector((state: GlobalState) => getUser(state, post.user_id));
    const isBot = Boolean(user && user.is_bot);

    // const {bots, activeBot, setActiveBot} = useBotlist();

    // const isBasicsLicensed = useIsBasicsLicensed();

    const summarizePost = async (postId: string) => {
        try {
            const result = await Client4.doSummarize(postId, 'kchat.bot');
            dispatch(selectPostById(result.postid));
            Client4.viewMyChannel(result.channelid);
        } catch (error) {
            console.error('Error summarizing post:', error);
        }
    };

    // if (!isBasicsLicensed) {
    //     return null;
    // }

    // Unconfigured state
    // if (bots && botsArray.length === 0) {
    //     return null;
    // }

    if (isBot || props.location === 'RHS_COMMENT') {
        return null;
    }

    return (
        <DotMenu
            icon={<IconAI/>}
            dropdownMenu={StyledDropdownMenu}
        >
            {/* <DropdownBotSelector
                bots={bots ?? []}
                activeBot={activeBot}
                setActiveBot={setActiveBot}
            />
            <Divider/> */}
            <DropdownMenuItem onClick={() => summarizePost(post.id)}>
                <span className='icon'><IconThreadSummarization/></span>
                <div className=''>
                    <FormattedMessage
                        id='ai.summarizeThread'
                        defaultMessage='Summarize'
                    />
                </div>

            </DropdownMenuItem>
            {/* <Divider/>
            <DropdownInfoOnlyVisibleToYou/> */}
        </DotMenu>
    );
};

const StyledDropdownMenu = styled(DropdownMenu)`
	min-width: 240px;
`;

export default PostMenu;
