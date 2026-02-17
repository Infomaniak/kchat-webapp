import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Client4} from 'mattermost-redux/client';

import {selectPostById} from 'actions/views/rhs';

import type {DispatchFunc} from 'types/store';

export default function useSummarize() {
    const dispatch: DispatchFunc = useDispatch();

    return useCallback(async (postId: string) => {
        try {
            const result = await Client4.doSummarize(postId, 'euria');
            dispatch(selectPostById(result.postid));
            Client4.viewMyChannel(result.channelid);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error summarizing post:', error);
        }
    }, [dispatch]);
}
