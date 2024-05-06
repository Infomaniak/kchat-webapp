// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers} from 'components/tours';
import {KmeetTour, useShowOnboardingTutorialStep} from 'components/tours/onboarding_tour';

import Constants from 'utils/constants';

import './meet_button.scss';
import meetSvg from './static/kmeet.svg';

export type Props = {
    currentChannelID: string;
    hasCall?: boolean;
    actions: {
        startOrJoinCallInChannelV2: (channelID: unknown) => void;
    };
}

const TIME_TO_AVOID_SPAMMING_CALL_BTN = 3000;

function MeetButton(props: Props) {
    const isGuest = useSelector(isCurrentUserGuestUser);
    const kmeetTourStep = isGuest ? OnboardingTourStepsForGuestUsers.KMEET : OnboardingTourSteps.KMEET;
    const showKmeetTutorialStep = useShowOnboardingTutorialStep(kmeetTourStep);
    const {actions} = props;
    const {startOrJoinCallInChannelV2} = actions;
    const ref = useRef<HTMLButtonElement>(null);
    let spamBtn = false;

    const onClick = () => {
        if (spamBtn) {
            return;
        }
        spamBtn = true;
        startOrJoinCallInChannelV2(props.currentChannelID);
        const timerId = setTimeout(() => {
            spamBtn = false;
            clearTimeout(timerId);
        }, TIME_TO_AVOID_SPAMMING_CALL_BTN);
    };

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
                        alt={props.hasCall ? 'join call' : 'start call'}
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
