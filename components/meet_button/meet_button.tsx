// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useRef} from 'react';
import {injectIntl, IntlShape, FormattedMessage} from 'react-intl';

// import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';

import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import store from 'stores/redux_store.jsx';
import {GlobalState} from 'types/store';

import SvgCallComponent from './SvgCallComponent';

export type Props = {
    currentChannelID: string;
    hasCall?: boolean;
    intl: IntlShape;
    startCallInChannel: Function;
}

// const configOverwrite = {
//     startWithAudioMuted: false,
//     startWithVideoMuted: true,
//     subject: 'toto',
// };

function MeetButton(props: Props) {
    // const {formatMessage} = props.intl;
    const {startCallInChannel} = props;
    const state = store.getState();
    const connectedCallID = useSelector((state: GlobalState) => state.views.calls.connectedCallID);
    const ref = useRef<HTMLButtonElement>(null);
    const channelID = useSelector(getCurrentChannelId);
    const currentUserId = getCurrentUserId(state);
    const onClick = React.useCallback(() => {
        startCallInChannel(channelID);
    }, [channelID]);

    const userIsInCall = connectedCallID ? props.hasCall[connectedCallID].map((u) => u).includes(currentUserId) : false;

    const tooltip = (
        <Tooltip id='call'>
            <FormattedMessage
                id={props.hasCall ? 'Join Call' : 'Start Call'}
                defaultMessage={props.hasCall ? 'Join Call' : 'Start Call'}
            />
        </Tooltip>
    );

    const btnClasses = `channel-header__icon channel-header__icon--call ${userIsInCall && 'channel-header__icon--calling'}`;
    return (
        <button
            type='button'
            className={btnClasses}
            onClick={onClick}
            ref={ref}
        >
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='bottom'
                overlay={tooltip}
            >
                <SvgCallComponent/>
            </OverlayTrigger>
        </button>
    );
}

const wrappedComponent = injectIntl(MeetButton);
wrappedComponent.displayName = 'injectIntl(MeetButton)';
export default wrappedComponent;
