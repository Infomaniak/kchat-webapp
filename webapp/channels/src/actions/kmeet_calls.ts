// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {lazy} from 'react';

import {Client4} from 'mattermost-redux/client';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUserById} from 'mattermost-redux/selectors/entities/users';

import {getCurrentLocale} from 'selectors/i18n';
import {getConferenceByChannelId, getIsCurrentUserInCall} from 'selectors/kmeet_calls';
import {isModalOpen} from 'selectors/views/modals';

import {withSuspense} from 'components/common/hocs/with_suspense';

import {isDesktopExtendedCallSupported, openWebCallInNewTab} from 'utils/calls_utils';
import {ActionTypes, ModalIdentifiers} from 'utils/constants';
import {isDesktopApp} from 'utils/user_agent';

import type {DispatchFunc, GlobalState} from 'types/store';

import {closeModal, openModal} from './views/modals';

const KmeetModal = withSuspense(lazy(() => import('components/kmeet_modal')));

export function openCallDialingModal(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const isCurrentUserAlreadyInCall = getIsCurrentUserInCall(state);
        if (isCurrentUserAlreadyInCall) {
            return;
        }

        if (isDesktopApp()) {
            const conference = getConferenceByChannelId(state, channelId);
            const currentUser = getCurrentUser(state);
            const caller = getUserById(state, conference.user_id);

            const users = conference.participants.map((id: string) => {
                const user = getUserById(state, id);
                return {
                    ...user,
                    avatar: Client4.getProfilePictureUrl(user.id, user.last_picture_update),
                };
            });

            window.desktopAPI?.openCallDialing?.({
                conference,
                currentUser,
                caller,
                users,
                channelId,
            });
        } else {
            if (isModalOpen(getState(), ModalIdentifiers.INCOMING_CALL)) {
                return;
            }

            dispatch(openModal(
                {
                    modalId: ModalIdentifiers.INCOMING_CALL,
                    dialogType: KmeetModal,
                    dialogProps: {
                        channelId,
                    },
                },
            ));
        }
    };
}

export function externalJoinCall(msg: any) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, msg.data.channel_id);
        const currentUserId = getCurrentUserId(state);

        if (!conference) {
            return;
        }

        if (conference.user_id === currentUserId && msg.data.user_id !== currentUserId) {
            dispatch(joinCallIfModalOpen(msg.data.channel_id));
        }

        dispatch({
            type: ActionTypes.KMEET_CALL_USER_CONNECTED,
            data: {
                channelId: msg.data.channel_id,
                userId: msg.data.user_id,
            },
        });
    };
}

export function joinCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const conference = getConferenceByChannelId(getState(), channelId);
        try {
            const answer = await Client4.acceptIncomingMeetCall(conference.id);
            dispatch(startCall(channelId, answer.jwt, conference.url, answer.name));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('cant join, call no longer exists', error);
            dispatch(deleteConference(conference.id, channelId));
        }
    };
}

export function joinCallIfModalOpen(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        if (isDesktopApp()) {
            const isOpen = await window.desktopAPI?.isRingCallWindowOpen?.();

            if (isOpen) {
                dispatch(joinCall(channelId));
            }
        } else {
            const isOpen = isModalOpen(getState(), ModalIdentifiers.INCOMING_CALL);
            if (isOpen) {
                dispatch(joinCall(channelId));
            }
        }
    };
}

export function declineCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const conference = getConferenceByChannelId(getState(), channelId);

        if (!conference) {
            return;
        }

        await Client4.declineIncomingMeetCall(conference.id);

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
}

export function cancelCall(channelId: string) {
    return async (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const conference = getConferenceByChannelId(state, channelId);
        const currentUserId = getCurrentUserId(getState());

        await Client4.cancelMeet(conference.id);

        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }

        dispatch({
            type: ActionTypes.VOICE_CHANNEL_USER_DISCONNECTED,
            data: {
                channelID: conference.channel_id,
                userID: currentUserId,
                currentUserID: currentUserId,
                callID: conference.id,
            },
        });

        return {data: true};
    };
}

export function startCall(channelId: string, jwt: string, url: string, subject: string) {
    return async (dispatch: DispatchFunc) => {
        if (isDesktopApp()) {
            if (!isDesktopExtendedCallSupported()) {
                return;
            }
            dispatch(startDesktopCall(channelId, jwt, subject));
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
            openWebCallInNewTab(url, jwt, subject);
        }
    };
}

export function startDesktopCall(channelId: string, jwt: string, subject: string) {
    return async (_: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const user = getCurrentUser(state);
        const conference = getConferenceByChannelId(state, channelId);
        const avatar = Client4.getProfilePictureUrl(user.id, user.last_picture_update);
        const locale = getCurrentLocale(state);

        window.desktopAPI?.openKmeetCallWindow?.({avatar, user, channelID: conference.channel_id, conferenceId: conference.id, name: subject, locale, jwt});
    };
}

export const closeRingModal = () => {
    return async (dispatch: DispatchFunc) => {
        if (isDesktopApp()) {
            window.desktopAPI?.closeRingCallWindow?.();
        } else {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
    };
};

export function deleteConference(callId: string, channelId: string) {
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        if (!isDesktopApp() && state.views.modals.modalState[ModalIdentifiers.INCOMING_CALL]?.dialogProps?.channelId === channelId) {
            dispatch(closeModal(ModalIdentifiers.INCOMING_CALL));
        }
        dispatch({
            type: ActionTypes.VOICE_CHANNEL_DELETED,
            data: {
                callID: callId,
                channelID: channelId,
            },
        });
    };
}
