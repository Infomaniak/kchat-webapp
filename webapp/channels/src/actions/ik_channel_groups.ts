import type {Group} from '@mattermost/types/groups';

import {GroupTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {General} from 'mattermost-redux/constants';

import type {ActionFuncAsync} from 'types/store';

export function fetchChannelGroups(channelId: string): ActionFuncAsync {
    return async (dispatch) => {
        const groups: Group[] = [];
        let page = 0;

        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                // eslint-disable-next-line no-await-in-loop
                const pageGroups = await Client4.getGroupsAssociatedToChannel(channelId, '', page, General.PAGE_SIZE_DEFAULT);
                groups.push(...pageGroups);
                if (pageGroups.length < General.PAGE_SIZE_DEFAULT) {
                    break;
                }
                page += 1;
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch channel groups:', error);
            return {error: true};
        }

        dispatch({
            type: GroupTypes.RECEIVED_GROUPS_ASSOCIATED_TO_CHANNEL,
            data: {channelID: channelId, groups, totalGroupCount: groups.length},
        });

        return {data: groups};
    };
}
