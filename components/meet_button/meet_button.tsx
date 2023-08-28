// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable no-console */
import React, {useRef} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage, injectIntl} from 'react-intl';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {KmeetTour, useShowOnboardingTutorialStep} from 'components/tours/onboarding_tour';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers} from 'components/tours';

import Constants from 'utils/constants';

import './meet_button.scss';
import meetSvg from './static/kmeet.svg';

export type Props = {
    currentChannelID: string;
    hasCall?: boolean;
    isCallDialingEnabled: boolean;
    startCallInChannel: (channelID: unknown) => void;
    startCallInChannelV2: (channelID: unknown) => void;
}

function MeetButton(props: Props) {
    const isGuest = useSelector(isCurrentUserGuestUser);
    const kmeetTourStep = isGuest ? OnboardingTourStepsForGuestUsers.KMEET : OnboardingTourSteps.KMEET;
    const showKmeetTutorialStep = useShowOnboardingTutorialStep(kmeetTourStep);
    const {isCallDialingEnabled, startCallInChannel, startCallInChannelV2} = props;
    const ref = useRef<HTMLButtonElement>(null);

    const fn = isCallDialingEnabled ? startCallInChannelV2 : startCallInChannel;

    const onClick = React.useCallback(() => {
        fn(props.currentChannelID);
    }, [props.currentChannelID, isCallDialingEnabled]);

    const tooltip = (
        <Tooltip
            id='call'
            className='meet-btn__overlay'
        >
            <FormattedMessage
                id={props.hasCall ? 'kmeet.calls.join' : 'kmeet.calls.start'}
                defaultMessage={props.hasCall ? 'Join call' : 'Start call'}
            />
        </Tooltip>
    );

    const btnClasses = 'btn meet-btn';
    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <div
                className='meet-btn__wrapper'
                id='channel-header-kmeet-btn'
            >
                {showKmeetTutorialStep && <KmeetTour/>}
                <button
                    type='button'
                    className={btnClasses}
                    onClick={onClick}
                    ref={ref}
                >
                    <img
                        src={meetSvg}
                        className='meet-btn__icon meet-btn__icon--16'
                    />
                    <span className='meet-btn__text'>
                        <FormattedMessage
                            id={props.hasCall ? 'kmeet.calls.join' : 'kmeet.calls.start'}
                            defaultMessage={props.hasCall ? 'Join call' : 'Start call'}
                        />
                    </span>
                </button>
            </div>
        </OverlayTrigger>
    );
}

const wrappedComponent = injectIntl(MeetButton);
wrappedComponent.displayName = 'injectIntl(MeetButton)';
export default wrappedComponent;
