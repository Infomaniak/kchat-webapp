// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';

import {GenericAction} from 'mattermost-redux/types/actions';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {makeGetChannelUnreadCount} from 'mattermost-redux/selectors/entities/channels';
import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {getFirstChannelName, getShowTutorialStep} from 'selectors/onboarding';
import {markMostRecentPostInChannelAsUnread, unsetEditingPost} from 'actions/post_actions';
import {isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {Channel} from '@mattermost/types/channels';
import {OnboardingTourSteps, TutorialTourName} from 'components/tours';
import {OnboardingTasksName} from 'components/onboarding_tasks';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function makeMapStateToProps() {
    const getUnreadCount = makeGetChannelUnreadCount();

    return (state: GlobalState, ownProps: OwnProps) => {
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const unreadCount = getUnreadCount(state, ownProps.channel.id);
        const firstChannelName = getFirstChannelName(state);
        const showChannelsTutorialStep = getShowTutorialStep(state, {
            tourName: TutorialTourName.ONBOARDING_TUTORIAL_STEP,
            taskName: OnboardingTasksName.CHANNELS_TOUR,
            tourStep: OnboardingTourSteps.CHANNELS,
        });

        return {
            unreadMentions: unreadCount.mentions,
            unreadMsgs: unreadCount.messages,
            isUnread: unreadCount.showUnread,
            isMuted: isChannelMuted(member),
            hasUrgent: unreadCount.hasUrgent,
            isChannelSelected: isChannelSelected(state, ownProps.channel.id),
            firstChannelName: showChannelsTutorialStep ? firstChannelName : '',
            showChannelsTutorialStep,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            markMostRecentPostInChannelAsUnread,
            unsetEditingPost,
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelLink);
