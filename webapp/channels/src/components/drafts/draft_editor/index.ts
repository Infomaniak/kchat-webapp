// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ActionCreatorsMapObject, Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {PreferenceType} from '@mattermost/types/preferences';

import {getChannelStats, getChannelTimezones} from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Permissions, Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {getAllChannelStats, makeGetChannel, getChannelMemberCountsByGroup as selectChannelMemberCountsByGroup} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';
import {isPostPriorityEnabled} from 'mattermost-redux/selectors/entities/posts';
import {getBool, isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import type {Action, ActionResult} from 'mattermost-redux/types/actions';

import {upsertScheduleDraft} from 'actions/views/drafts';
import {openModal} from 'actions/views/modals';
import {getCurrentLocale} from 'selectors/i18n';
import {connectionErrorCount} from 'selectors/views/system';

import Constants, {AdvancedTextEditor, Preferences} from 'utils/constants';
import {canUploadFiles} from 'utils/file_utils';

import type {ModalData} from 'types/actions';
import type {GlobalState} from 'types/store';
import type {PostDraft} from 'types/store/draft';

import DraftEditor from './draft_editor';

type OwnProps = {
    draft: PostDraft;
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const getChannel = makeGetChannel();
    const channel = getChannel(state, {id: ownProps.draft.channelId});
    const config = getConfig(state);
    const currentTeamId = getCurrentTeamId(state);
    const canUseCustomGroupMentions = isCustomGroupsEnabled(state) && haveIChannelPermission(state, currentTeamId, channel.id, Permissions.USE_GROUP_MENTIONS);
    return {
        canPost: haveIChannelPermission(state, currentTeamId, channel.id, Permissions.CREATE_POST),
        currentUserId: getCurrentUserId(state),
        channel,
        isFormattingBarHidden: getBool(state, Preferences.ADVANCED_TEXT_EDITOR, AdvancedTextEditor.POST),
        maxPostSize: parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
        badConnection: connectionErrorCount(state) > 1,
        canUseChannelMentions: haveIChannelPermission(state, currentTeamId, channel.id, Permissions.USE_CHANNEL_MENTIONS),
        canUploadFiles: canUploadFiles(config),
        canUseCustomGroupMentions,
        isEmojiPickerEnabled: config.EnableEmojiPicker === 'true',
        isConfirmNotificationsToChannnelEnabled: config.EnableConfirmNotificationsToChannel === 'true',
        isGifPickerEnabled: config.EnableGifPicker === 'true',
        isTimezoneEnabled: config.ExperimentalTimezone === 'true',
        codeBlockOnCtrlEnter: getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        isPostPriorityEnabled: isPostPriorityEnabled(state),
        locale: getCurrentLocale(state),
        groupsWithAllowReference: canUseCustomGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeamId, channel.id) : null,
        channelMemberCountsByGroup: selectChannelMemberCountsByGroup(state, channel.id),
        channelMembersCount: getAllChannelStats(state)[channel.id]?.member_count ?? 1,
    };
};

type Actions = {
    savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<ActionResult>;
    openModal: <P>(modalData: ModalData<P>) => void;
    upsertScheduleDraft: (key: string, draft: PostDraft, rootId: string) => Promise<ActionResult>;
    getChannelTimezones: (channelId: string) => Promise<ActionResult>;
    getChannelStats: (channelId: string) => Promise<ActionResult>;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
        savePreferences,
        openModal,
        upsertScheduleDraft,
        getChannelTimezones,
        getChannelStats,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DraftEditor);
