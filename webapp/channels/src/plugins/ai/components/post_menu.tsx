import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import type {Post} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {selectPostById} from 'actions/views/rhs';

import type {GlobalState} from 'types/store';

import IconEuria from './assets/icon_euria';
import IconThreadSummarization from './assets/icon_thread_summarization';
import DotMenu, {DropdownMenu, DropdownMenuItem} from './dot_menu';

type Props = {
    post: Post;
    location: string;
}

const PostMenu = (props: Props) => {
    const dispatch = useDispatch();

    const post = props.post;

    const user = useSelector((state: GlobalState) => getUser(state, post.user_id));
    const isBot = Boolean(user && user.is_bot);

    const summarizePost = async (postId: string) => {
        try {
            const result = await Client4.doSummarize(postId, 'euria');
            dispatch(selectPostById(result.postid));
            Client4.viewMyChannel(result.channelid);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error summarizing post:', error);
        }
    };

    if (isBot || props.location === 'RHS_COMMENT') {
        return null;
    }

    return (
        <DotMenu
            icon={<IconEuria/>}
            dropdownMenu={StyledDropdownMenu}
        >
            <DropdownMenuItem onClick={() => summarizePost(post.id)}>
                <span className='icon'><IconThreadSummarization/></span>
                <div className=''>
                    <FormattedMessage
                        id='ai.summarizeThread'
                        defaultMessage='Summarize'
                    />
                </div>

            </DropdownMenuItem>
        </DotMenu>
    );
};

const StyledDropdownMenu = styled(DropdownMenu)`
	min-width: 240px;
`;

export default PostMenu;
