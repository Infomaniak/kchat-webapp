import React from 'react';
import {useParams} from 'react-router-dom';

import KmeetModal from 'components/kmeet_modal';
type Params = {
    channelId: string;
}
const Ringing = () => {
    const params = useParams<Params>();
    return <KmeetModal channelId={params.channelId}/>;
};

export default Ringing;
