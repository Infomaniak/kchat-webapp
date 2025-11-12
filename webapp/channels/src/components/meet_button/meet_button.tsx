// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import type {Channel} from '@mattermost/types/channels';

import {isCurrentUserGuestUser} from 'mattermost-redux/selectors/entities/users';

import ConfirmModal from 'components/confirm_modal';
import {OnboardingTourSteps, OnboardingTourStepsForGuestUsers} from 'components/tours';
import {KmeetTour, useShowOnboardingTutorialStep} from 'components/tours/onboarding_tour';

import Constants, {ModalIdentifiers} from 'utils/constants';

import type {ModalData} from 'types/actions';

import './meet_button.scss';
import meetSvg from './static/kmeet.svg';

export type Props = {
    channel?: Channel;
    hasCall?: boolean;
    membersCount: number;

    actions: {
        startOrJoinCallInChannelV2: (channelID: unknown) => void;
        joinCall: (channelID: unknown) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (ModalIdentifier: string) => void;
    };
}

const TIME_TO_AVOID_SPAMMING_CALL_BTN = 3000;

function MeetButton(props: Props) {
    const {actions, channel, membersCount} = props;

    const isGuest = useSelector(isCurrentUserGuestUser);
    const kmeetTourStep = isGuest ? OnboardingTourStepsForGuestUsers.KMEET : OnboardingTourSteps.KMEET;
    const showKmeetTutorialStep = useShowOnboardingTutorialStep(kmeetTourStep);

    // const {startOrJoinCallInChannelV2, joinCall} = actions;
    const ref = useRef<HTMLButtonElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const onClick = () => {
        if (timeoutRef.current) {
            return;
        }

        if (membersCount >= Constants.MIN_MEMBERS_FOR_CALL_CONFIRM_MODAL) {
            openModal();
            return;
        }

        startCall();

        timeoutRef.current = setTimeout(() => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }, TIME_TO_AVOID_SPAMMING_CALL_BTN);
    };

    const openModal = () => {
        if (!channel) {
            return;
        }
        const title = (
            <FormattedMessage
                id='kmeet_call_modal.title'
                defaultMessage='Start a call in the channel {name}'
                values={{name: <strong>{channel.display_name}</strong>}}
            />
        );
        const message = (
            <FormattedMessage
                id='kmeet_call_modal.message'
                defaultMessage='{count} people will be notified to join this call. Do you really want to start a call in the channel {name}'
                values={{count: <strong>{membersCount}</strong>, name: <strong>{channel.display_name}</strong>}}
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='kmeet_call_modal.confirm'
                defaultMessage='Start the call'
            />
        );
        const cancelButtonText = (
            <FormattedMessage
                id='kmeet_call_modal.cancel'
                defaultMessage='Cancel'
            />
        );

        actions.openModal({
            modalId: ModalIdentifiers.KMEET_CALL_MODAL,
            dialogType: ConfirmModal,
            dialogProps: {
                show: true,
                title,
                message,
                confirmButtonText,
                cancelButtonText,
                onConfirm,
                onCancel,
                onHide: onCancel,
                onExited: onCancel,
            },
        });
    };

    const startCall = () => {
        if (!channel) {
            return;
        }
        if (props.hasCall) {
            props.actions?.joinCall(channel.id);
        } else {
            props.actions?.startOrJoinCallInChannelV2(channel.id);
        }
    };

    const onConfirm = () => {
        actions.closeModal(ModalIdentifiers.KMEET_CALL_MODAL);
        startCall();
    };

    const onCancel = () => {
        actions.closeModal(ModalIdentifiers.KMEET_CALL_MODAL);
    };

    const btnClasses = 'btn meet-btn';
    return (
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
                    className='meet-btn__icon meet-btn__icon--18'
                />
                <span className='meet-btn__text'>
                    <FormattedMessage
                        id={props.hasCall ? 'kmeet.calls.join' : 'kmeet.calls.start'}
                        defaultMessage={props.hasCall ? 'Join call' : 'Start call'}
                    />
                </span>
            </button>
        </div>
    );
}

export default MeetButton;
