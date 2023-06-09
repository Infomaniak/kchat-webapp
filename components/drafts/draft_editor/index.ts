// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions, Preferences as PreferencesRedux} from 'mattermost-redux/constants';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelStats, makeGetChannel, getChannelMemberCountsByGroup as selectChannelMemberCountsByGroup} from 'mattermost-redux/selectors/entities/channels';
import {getBool, isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {isPostPriorityEnabled} from 'mattermost-redux/selectors/entities/posts';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {openModal} from 'actions/views/modals';
import {upsertScheduleDraft} from 'actions/views/drafts';
import {connectionErrorCount} from 'selectors/views/system';
import {getCurrentLocale} from 'selectors/i18n';

import Constants, {AdvancedTextEditor, Preferences} from 'utils/constants';
import {canUploadFiles} from 'utils/file_utils';

import {GlobalState} from 'types/store';
import {PostDraft} from 'types/store/draft';

import DraftEditor from './draft_editor';

type OwnProps = {
    draft: PostDraft;
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
    const getChannel = makeGetChannel();
    const config = getConfig(state);
    const currentTeamId = getCurrentTeamId(state);
    const canUseCustomGroupMentions = isCustomGroupsEnabled(state) && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
    return {
        canPost: haveICurrentChannelPermission(state, Permissions.CREATE_POST),
        currentUserId: getCurrentUserId(state),
        channel: getChannel(state, {id: ownProps.draft.channelId}),
        isFormattingBarHidden: getBool(state, Preferences.ADVANCED_TEXT_EDITOR, AdvancedTextEditor.POST),
        maxPostSize: parseInt(config.MaxPostSize || '', 10) || Constants.DEFAULT_CHARACTER_LIMIT,
        badConnection: connectionErrorCount(state) > 1,
        canUseChannelMentions: haveICurrentChannelPermission(state, Permissions.USE_CHANNEL_MENTIONS),
        canUploadFiles: canUploadFiles(config),
        canUseCustomGroupMentions,
        isEmojiPickerEnabled: config.EnableEmojiPicker === 'true',
        isConfirmNotificationsToChannnelEnabled: config.EnableConfirmNotificationsToChannel === 'true',
        isGifPickerEnabled: config.EnableGifPicker === 'true',
        codeBlockOnCtrlEnter: getBool(state, PreferencesRedux.CATEGORY_ADVANCED_SETTINGS, 'code_block_ctrl_enter', true),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
        isPostPriorityEnabled: isPostPriorityEnabled(state),
        locale: getCurrentLocale(state),
        groupsWithAllowReference: canUseCustomGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeamId, ownProps.draft.channelId) : null,
        channelMemberCountsByGroup: selectChannelMemberCountsByGroup(state, ownProps.draft.channelId),
        currentChannelMembersCount: getCurrentChannelStats(state)?.member_count ?? 1,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        savePreferences,
        openModal,
        upsertScheduleDraft,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DraftEditor);
