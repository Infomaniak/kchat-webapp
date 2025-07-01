// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {CloudUsage} from '@mattermost/types/cloud';

import type {MMReduxAction} from 'mattermost-redux/action_types';
import {CloudTypes} from 'mattermost-redux/action_types';

const emptyUsage: CloudUsage = {
    storage: 0,
    public_channels: 0,
    private_channels: 0,
    guests: 0,
    pending_guests: 0,
    members: 0,
    usageLoaded: false,
    files: {
        totalStorage: 0,
        totalStorageLoaded: true,
    },
    messages: {
        history: 0,
        historyLoaded: true,
    },
    teams: {
        active: 0,
        cloudArchived: 0,
        teamsLoaded: true,
    },
    custom_emojis: 0,
    incoming_webhooks: 0,
    outgoing_webhooks: 0,
    sidebar_categories: 0,
    scheduled_draft_custom_date: 0,
};

// represents the usage associated with this workspace
export default function usage(state: CloudUsage = emptyUsage, action: MMReduxAction) {
    switch (action.type) {
    case CloudTypes.RECEIVED_USAGE:{
        return {
            ...state,
            ...action.data,
            usageLoaded: true,
        };}
    case CloudTypes.RECEIVED_MESSAGES_USAGE: {
        return {
            ...state,
            messages: {
                history: action.data,
                historyLoaded: true,
            },
        };
    }
    case CloudTypes.RECEIVED_FILES_USAGE: {
        return {
            ...state,
            files: {
                totalStorage: action.data,
                totalStorageLoaded: true,
            },
        };
    }
    case CloudTypes.RECEIVED_BOARDS_USAGE: {
        return {
            ...state,
            boards: {
                cards: action.data,
                cardsLoaded: true,
            },
        };
    }
    case CloudTypes.RECEIVED_TEAMS_USAGE: {
        return {
            ...state,
            teams: {
                ...action.data,
                teamsLoaded: true,
            },
        };
    }
    default:
        return state;
    }
}
