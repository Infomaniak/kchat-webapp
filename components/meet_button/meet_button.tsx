// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */
import React, {useRef} from 'react';
import {injectIntl, IntlShape, FormattedMessage} from 'react-intl';

// import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {useSelector} from 'react-redux';

import OverlayTrigger from 'components/overlay_trigger';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';

import {GlobalState} from 'types/store';

import SvgCallComponent from './SvgCallComponent';

export type Props = {
    currentChannelID: string;
    hasCall?: boolean;
    intl: IntlShape;
    startCallInChannel: (channelID: string) => void;
    isInCall: boolean;
}

function logInfo(props: Props, connectedChannelID: string, channelID: string) {
    console.log(props);
    console.log('');
    console.log('Connected voice channel Id => ', connectedChannelID);
    console.log('Current channel Id => ', channelID);
}

function MeetButton(props: Props) {
    // const {formatMessage} = props.intl;
    const {startCallInChannel} = props;
    const connectedChannelID = useSelector((state: GlobalState) => state.views.calls.connectedChannelID);
    const ref = useRef<HTMLButtonElement>(null);
    const channelID = useSelector(getCurrentChannelId);
    const onClick = React.useCallback(() => {
        startCallInChannel(channelID);
    }, [channelID]);

    logInfo(props, connectedChannelID, channelID);

    const tooltip = (
        <Tooltip id='call'>
            <FormattedMessage
                id={props.hasCall ? 'Join Call' : 'Start Call'}
                defaultMessage={props.hasCall ? 'Join Call' : 'Start Call'}
            />
        </Tooltip>
    );

    const btnClasses = `channel-header__icon channel-header__icon--call ${props.isInCall && 'channel-header__icon--calling'}`;
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
