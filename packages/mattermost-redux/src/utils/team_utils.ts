// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Team} from '@mattermost/types/teams';
import {IDMappedObjects} from '@mattermost/types/utilities';
import {Client4} from 'mattermost-redux/client';
import {getCookie, setCookie} from 'mattermost-redux/utils/cookie_utils';
import {General} from '../constants';

const LAST_KSUITE_COOKIE = 'LAST_KSUITE';
const TEAMS_ORDER_COOKIE = 'TEAMS_ORDER';

export function teamListToMap(teamList: Team[]): IDMappedObjects<Team> {
    const teams: Record<string, Team> = {};
    if (teamList) {
        for (let i = 0; i < teamList.length; i++) {
            teams[teamList[i].id] = teamList[i];
        }
    }
    return teams;
}

export function sortTeamsWithLocale(locale: string): (a: Team, b: Team) => number {
    return (a: Team, b: Team): number => {
        if (a.display_name !== b.display_name) {
            return a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
        }

        return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
    };
}

export function filterTeamsStartingWithTerm(teams: Team[], term: string): Team[] {
    const lowercasedTerm = term.toLowerCase();

    return teams.filter((team: Team) => {
        if (!team) {
            return false;
        }

        const name = team.name?.toLowerCase();
        const displayName = team.display_name?.toLowerCase();

        return name.startsWith(lowercasedTerm) ||
            displayName.startsWith(lowercasedTerm);
    });
}

export const getLastKSuiteSeenId = () => getCookie(LAST_KSUITE_COOKIE);

export const setLastKSuiteSeenCookie = (teamId: string) => {
    if (!Client4.isIkBaseUrl()) {
        setCookie(LAST_KSUITE_COOKIE, teamId);
    }
};

export const getTeamsOrderCookie = () => getCookie(TEAMS_ORDER_COOKIE);

export const setTeamsOrderCookie = (teamOrder: string) => setCookie(TEAMS_ORDER_COOKIE, teamOrder);
