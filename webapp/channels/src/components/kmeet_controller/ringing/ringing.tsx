import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router-dom';

import {getChannel} from 'mattermost-redux/actions/channels';
import {getChannel as getChannelSelector} from 'mattermost-redux/selectors/entities/channels';

import KmeetModal from 'components/kmeet_modal';

import type {GlobalState} from 'types/store';
type Params = {
    channelId: string;
}
const Ringing = () => {
    const params = useParams<Params>();
    const dispatch = useDispatch();
    const channel = useSelector((state: GlobalState) => getChannelSelector(state, params.channelId));

    useEffect(() => {
        dispatch(getChannel(params.channelId));
    }, [dispatch, params.channelId]);

    return channel ? <KmeetModal channelId={channel.id}/> : <></>;
};

export default Ringing;
